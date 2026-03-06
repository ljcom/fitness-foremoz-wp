import express from 'express';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';
import { query, pool } from './db.js';
import { appendDomainEvent } from './event-store.js';
import { runCoachProjection } from './projection.js';
import { hashPassword, normalizeEmail, verifyPassword } from './auth.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.corsOrigin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).send();
  return next();
});

function fail(statusCode, errorCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  return error;
}

function required(value, name) {
  if (value === undefined || value === null || value === '') {
    throw fail(400, 'VALIDATION_ERROR', `${name} is required`);
  }
  return value;
}

async function appendAndProject({
  tenantId,
  branchId,
  actorId,
  actorKind,
  eventType,
  subjectKind,
  subjectId,
  data,
  refs
}) {
  const event = await appendDomainEvent({
    tenantId,
    branchId,
    actorId,
    actorKind,
    eventType,
    subjectKind,
    subjectId,
    data,
    refs,
    ts: new Date().toISOString()
  });
  const projection = await runCoachProjection({ tenantId, branchId });
  return { event, projection };
}

app.get('/health', async (_req, res) => {
  try {
    await query('select 1');
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'FAIL', error_code: 'DB_UNAVAILABLE', message: error.message });
  }
});

app.post('/v1/tenant/auth/signup', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const email = normalizeEmail(required(data.email, 'email'));
    const password = String(required(data.password, 'password'));
    const fullName = required(data.full_name, 'full_name');
    const coachId = data.coach_id || `coach_${Date.now()}_${randomUUID().slice(0, 8)}`;

    if (password.length < 8) {
      throw fail(400, 'AUTH_WEAK_PASSWORD', 'password min length is 8 characters');
    }

    const existing = await query(
      `select coach_id
       from read.rm_coach_account_auth
       where tenant_id = $1 and email = $2
       limit 1`,
      [tenantId, email]
    );
    if (existing.rows[0]) {
      throw fail(409, 'AUTH_EMAIL_EXISTS', 'email already registered');
    }

    const passwordHash = await hashPassword(password);
    const payload = {
      tenant_id: tenantId,
      coach_id: coachId,
      full_name: fullName,
      email,
      password_hash: passwordHash,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await appendAndProject({
      tenantId,
      branchId: null,
      actorId: data.actor_id || coachId,
      actorKind: 'owner',
      eventType: 'coach.account.created',
      subjectKind: 'coach_account',
      subjectId: coachId,
      data: payload,
      refs: {}
    });

    return res.status(201).json({
      status: 'PASS',
      user: {
        tenant_id: tenantId,
        coach_id: coachId,
        full_name: fullName,
        email,
        status: 'active'
      },
      ...result
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/tenant/auth/signin', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const email = normalizeEmail(required(data.email, 'email'));
    const password = String(required(data.password, 'password'));

    const authResult = await query(
      `select tenant_id, coach_id, full_name, email, password_hash, status
       from read.rm_coach_account_auth
       where tenant_id = $1 and email = $2
       limit 1`,
      [tenantId, email]
    );
    const authRow = authResult.rows[0] || null;
    if (!authRow) {
      throw fail(401, 'AUTH_INVALID_CREDENTIALS', 'invalid email or password');
    }
    if (authRow.status !== 'active') {
      throw fail(403, 'AUTH_ACCOUNT_INACTIVE', 'account is not active');
    }

    const matched = await verifyPassword(password, authRow.password_hash);
    if (!matched) {
      throw fail(401, 'AUTH_INVALID_CREDENTIALS', 'invalid email or password');
    }

    return res.json({
      status: 'PASS',
      user: {
        tenant_id: authRow.tenant_id,
        coach_id: authRow.coach_id,
        full_name: authRow.full_name,
        email: authRow.email,
        status: authRow.status
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/coach/profile', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const coachId = required(req.query.coach_id, 'coach_id');
    const { rows } = await query(
      `select tenant_id, coach_id, coach_handle, display_name, bio, status, updated_at
       from read.rm_coach_profile_public
       where tenant_id = $1 and coach_id = $2
       limit 1`,
      [tenantId, coachId]
    );
    return res.json({ status: 'PASS', item: rows[0] || null });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/coach/profile/publish', async (req, res, next) => {
  try {
    const d = req.body || {};
    const coachId = required(d.coach_id, 'coach_id');
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      coach_id: coachId,
      coach_handle: required(d.coach_handle, 'coach_handle'),
      display_name: required(d.display_name, 'display_name'),
      bio: d.bio || null,
      status: 'active',
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || coachId,
      actorKind: 'pt',
      eventType: 'coach.profile.published',
      subjectKind: 'coach',
      subjectId: coachId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/coach/offers/publish', async (req, res, next) => {
  try {
    const d = req.body || {};
    const offerId = d.offer_id || `offer_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      offer_id: offerId,
      coach_id: required(d.coach_id, 'coach_id'),
      offer_name: required(d.offer_name, 'offer_name'),
      price_amount: Number(d.price_amount || 0),
      status: 'active',
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || payload.coach_id,
      actorKind: 'pt',
      eventType: 'coach.offer.published',
      subjectKind: 'offer',
      subjectId: offerId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/campaign/share', async (req, res, next) => {
  try {
    const d = req.body || {};
    const shareId = d.share_id || `shr_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      share_id: shareId,
      coach_id: required(d.coach_id, 'coach_id'),
      channel: required(d.channel, 'channel'),
      target_url: required(d.target_url, 'target_url'),
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || payload.coach_id,
      actorKind: 'pt',
      eventType: 'coach.microsite.link.shared',
      subjectKind: 'campaign_share',
      subjectId: shareId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/campaign/click', async (req, res, next) => {
  try {
    const d = req.body || {};
    const clickId = d.click_id || `clk_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      click_id: clickId,
      share_id: required(d.share_id, 'share_id'),
      coach_id: required(d.coach_id, 'coach_id'),
      channel: d.channel || 'direct',
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || 'system_tracking',
      actorKind: 'system',
      eventType: 'coach.campaign.clicked',
      subjectKind: 'campaign_click',
      subjectId: clickId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/subscriptions/create', async (req, res, next) => {
  try {
    const d = req.body || {};
    const subscriptionId = d.subscription_id || `sub_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      subscription_id: subscriptionId,
      coach_id: required(d.coach_id, 'coach_id'),
      member_id: required(d.member_id, 'member_id'),
      offer_id: required(d.offer_id, 'offer_id'),
      source_channel: d.source_channel || 'direct',
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || payload.member_id,
      actorKind: 'member',
      eventType: 'subscription.created',
      subjectKind: 'subscription',
      subjectId: subscriptionId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/classes/schedule', async (req, res, next) => {
  try {
    const d = req.body || {};
    const classId = d.class_id || `cls_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      class_id: classId,
      coach_id: required(d.coach_id, 'coach_id'),
      location_id: required(d.location_id, 'location_id'),
      studio_id: d.studio_id || null,
      start_at: required(d.start_at, 'start_at'),
      capacity: Number(required(d.capacity, 'capacity')),
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || payload.coach_id,
      actorKind: 'pt',
      eventType: 'class.scheduled',
      subjectKind: 'class',
      subjectId: classId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/invitations/send', async (req, res, next) => {
  try {
    const d = req.body || {};
    const invitationId = d.invitation_id || `inv_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      invitation_id: invitationId,
      inviter_actor_kind: required(d.inviter_actor_kind, 'inviter_actor_kind'),
      invitee_actor_kind: required(d.invitee_actor_kind, 'invitee_actor_kind'),
      target_contact: d.target_contact || null,
      channel: d.channel || null,
      status: 'pending',
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || 'system_invitation',
      actorKind: payload.inviter_actor_kind,
      eventType: 'invitation.sent',
      subjectKind: 'invitation',
      subjectId: invitationId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/invitations/respond', async (req, res, next) => {
  try {
    const d = req.body || {};
    const status = required(d.status, 'status');
    if (!['accepted', 'rejected'].includes(status)) {
      throw fail(400, 'VALIDATION_ERROR', 'status must be accepted or rejected');
    }
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      invitation_id: required(d.invitation_id, 'invitation_id'),
      inviter_actor_kind: required(d.inviter_actor_kind, 'inviter_actor_kind'),
      invitee_actor_kind: required(d.invitee_actor_kind, 'invitee_actor_kind'),
      target_contact: d.target_contact || null,
      channel: d.channel || null,
      status,
      updated_at: new Date().toISOString()
    };
    const eventType = status === 'accepted' ? 'invitation.accepted' : 'invitation.rejected';
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || 'system_invitation',
      actorKind: payload.invitee_actor_kind,
      eventType,
      subjectKind: 'invitation',
      subjectId: payload.invitation_id,
      data: payload,
      refs: {}
    });
    return res.status(200).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/support-team/members', async (req, res, next) => {
  try {
    const d = req.body || {};
    const teamMemberId = d.team_member_id || `tm_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const tenantId = d.tenant_id || config.defaultTenantId;
    const payload = {
      tenant_id: tenantId,
      team_member_id: teamMemberId,
      coach_id: required(d.coach_id, 'coach_id'),
      role_name: d.role_name || 'cs',
      location_scope: d.location_scope || null,
      updated_at: new Date().toISOString()
    };

    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || payload.coach_id,
      actorKind: 'pt',
      eventType: 'coach.team.member.added',
      subjectKind: 'coach_team_member',
      subjectId: teamMemberId,
      data: payload,
      refs: {}
    });
    return res.status(201).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/pricing/plan/change', async (req, res, next) => {
  try {
    const d = req.body || {};
    const tenantId = d.tenant_id || config.defaultTenantId;
    const coachId = required(d.coach_id, 'coach_id');
    const payload = {
      tenant_id: tenantId,
      coach_id: coachId,
      plan_code: required(d.plan_code, 'plan_code'),
      plan_status: d.plan_status || 'active',
      effective_at: d.effective_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const result = await appendAndProject({
      tenantId,
      branchId: d.branch_id || null,
      actorId: d.actor_id || coachId,
      actorKind: 'owner',
      eventType: 'pricing.plan.changed',
      subjectKind: 'coach_plan',
      subjectId: `${coachId}:${payload.plan_code}`,
      data: payload,
      refs: {}
    });
    return res.status(200).json({ status: 'PASS', ...result });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/projections/run', async (req, res, next) => {
  try {
    const tenantId = req.body?.tenant_id || config.defaultTenantId;
    const branchId = req.body?.branch_id || null;
    const result = await runCoachProjection({ tenantId, branchId });
    return res.json({ status: 'PASS', projection: result });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/funnel', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const { rows } = await query(
      `select * from read.rm_subscription_funnel where tenant_id = $1 order by updated_at desc limit 200`,
      [tenantId]
    );
    return res.json({ status: 'PASS', items: rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/classes/location', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const { rows } = await query(
      `select * from read.rm_location_class_list where tenant_id = $1 order by start_at asc limit 200`,
      [tenantId]
    );
    return res.json({ status: 'PASS', items: rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/support-team', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const { rows } = await query(
      `select * from read.rm_support_team where tenant_id = $1 order by updated_at desc limit 200`,
      [tenantId]
    );
    return res.json({ status: 'PASS', items: rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/pricing-plan', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const { rows } = await query(
      `select * from read.rm_pricing_plan_state where tenant_id = $1 order by updated_at desc limit 200`,
      [tenantId]
    );
    return res.json({ status: 'PASS', items: rows });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_ERROR';
  return res.status(statusCode).json({ status: 'FAIL', error_code: errorCode, message: error.message });
});

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[coach-api] listening on :${config.port}`);
});

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[coach-api] received ${signal}, shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
