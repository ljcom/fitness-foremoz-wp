import express from 'express';
import { query, pool } from './db.js';
import { appendDomainEvent } from './event-store.js';
import { runFitnessProjection } from './projection.js';
import { config } from './config.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

function required(value, name) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${name} is required`);
  }
  return value;
}

function ok(res, data) {
  return res.status(200).json({ status: 'PASS', ...data });
}

function created(res, data) {
  return res.status(201).json({ status: 'PASS', ...data });
}

app.get('/health', async (_req, res) => {
  try {
    await query('select 1');
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'FAIL', error_code: 'DB_UNAVAILABLE', message: error.message });
  }
});

app.post('/v1/members/register', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const event = await appendDomainEvent({
      tenantId,
      branchId: data.branch_id || null,
      actorId: data.actor_id || config.defaultActorId,
      eventType: 'member.registered',
      subjectKind: 'member',
      subjectId: required(data.member_id, 'member_id'),
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id || null,
        member_id: required(data.member_id, 'member_id'),
        full_name: required(data.full_name, 'full_name'),
        phone: data.phone || null,
        status: data.status || 'active'
      },
      refs: {}
    });
    return created(res, { event });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/subscriptions/activate', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const event = await appendDomainEvent({
      tenantId,
      branchId: data.branch_id || null,
      actorId: data.actor_id || config.defaultActorId,
      eventType: 'subscription.activated',
      subjectKind: 'subscription',
      subjectId: required(data.subscription_id, 'subscription_id'),
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id || null,
        subscription_id: required(data.subscription_id, 'subscription_id'),
        member_id: required(data.member_id, 'member_id'),
        plan_id: required(data.plan_id, 'plan_id'),
        start_date: required(data.start_date, 'start_date'),
        end_date: required(data.end_date, 'end_date'),
        status: data.status || 'active'
      },
      refs: { payment_id: data.payment_id || null }
    });
    return created(res, { event });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/payments/record', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const event = await appendDomainEvent({
      tenantId,
      branchId: data.branch_id || null,
      actorId: data.actor_id || config.defaultActorId,
      eventType: 'payment.recorded',
      subjectKind: 'payment',
      subjectId: required(data.payment_id, 'payment_id'),
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id || null,
        payment_id: required(data.payment_id, 'payment_id'),
        member_id: required(data.member_id, 'member_id'),
        subscription_id: data.subscription_id || null,
        amount: Number(required(data.amount, 'amount')),
        currency: required(data.currency, 'currency'),
        method: required(data.method, 'method'),
        proof_url: data.proof_url || null,
        recorded_at: data.recorded_at || new Date().toISOString()
      },
      refs: { subscription_id: data.subscription_id || null }
    });
    return created(res, { event });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/checkins/log', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const event = await appendDomainEvent({
      tenantId,
      branchId: required(data.branch_id, 'branch_id'),
      actorId: data.actor_id || config.defaultActorId,
      eventType: 'checkin.logged',
      subjectKind: 'checkin',
      subjectId: required(data.checkin_id, 'checkin_id'),
      data: {
        tenant_id: tenantId,
        branch_id: required(data.branch_id, 'branch_id'),
        checkin_id: required(data.checkin_id, 'checkin_id'),
        member_id: required(data.member_id, 'member_id'),
        channel: data.channel || 'manual',
        checkin_at: data.checkin_at || new Date().toISOString()
      },
      refs: {}
    });
    return created(res, { event });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/bookings/classes/create', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const event = await appendDomainEvent({
      tenantId,
      branchId: required(data.branch_id, 'branch_id'),
      actorId: data.actor_id || config.defaultActorId,
      eventType: 'class.booking.created',
      subjectKind: 'booking',
      subjectId: required(data.booking_id, 'booking_id'),
      data: {
        tenant_id: tenantId,
        branch_id: required(data.branch_id, 'branch_id'),
        booking_id: required(data.booking_id, 'booking_id'),
        class_id: required(data.class_id, 'class_id'),
        booking_kind: data.booking_kind || 'member',
        member_id: data.member_id || null,
        guest_name: data.guest_name || null,
        status: data.status || 'booked',
        booked_at: data.booked_at || new Date().toISOString()
      },
      refs: { subscription_id: data.subscription_id || null }
    });
    return created(res, { event });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/pt/packages/assign', async (req, res, next) => {
  try {
    const data = req.body || {};
    const tenantId = data.tenant_id || config.defaultTenantId;
    const event = await appendDomainEvent({
      tenantId,
      branchId: required(data.branch_id, 'branch_id'),
      actorId: data.actor_id || config.defaultActorId,
      eventType: 'pt.package.assigned',
      subjectKind: 'pt_package',
      subjectId: required(data.pt_package_id, 'pt_package_id'),
      data: {
        tenant_id: tenantId,
        branch_id: required(data.branch_id, 'branch_id'),
        pt_package_id: required(data.pt_package_id, 'pt_package_id'),
        member_id: required(data.member_id, 'member_id'),
        trainer_id: data.trainer_id || null,
        total_sessions: Number(required(data.total_sessions, 'total_sessions')),
        assigned_at: data.assigned_at || new Date().toISOString()
      },
      refs: {}
    });
    return created(res, { event });
  } catch (error) {
    return next(error);
  }
});

app.post('/v1/projections/run', async (req, res, next) => {
  try {
    const data = req.body || {};
    const result = await runFitnessProjection({
      tenantId: data.tenant_id || config.defaultTenantId,
      branchId: data.branch_id || null
    });
    return ok(res, result);
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/members', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const branchId = req.query.branch_id || null;
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
    const params = [tenantId];
    let sql = `select * from read.rm_member where tenant_id = $1`;
    if (branchId) {
      params.push(branchId);
      sql += ` and branch_id = $2`;
    }
    params.push(limit);
    sql += ` order by updated_at desc limit $${params.length}`;
    const { rows } = await query(sql, params);
    return ok(res, { rows, limit });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/subscriptions/active', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const branchId = req.query.branch_id || null;
    const params = [tenantId];
    let sql = `select * from read.rm_subscription_active where tenant_id = $1 and status = 'active'`;
    if (branchId) {
      params.push(branchId);
      sql += ` and branch_id = $2`;
    }
    sql += ` order by end_date asc`;
    const { rows } = await query(sql, params);
    return ok(res, { rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/class-availability', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const branchId = req.query.branch_id || null;
    const params = [tenantId];
    let sql = `select * from read.rm_class_availability where tenant_id = $1`;
    if (branchId) {
      params.push(branchId);
      sql += ` and branch_id = $2`;
    }
    sql += ` order by start_at asc`;
    const { rows } = await query(sql, params);
    return ok(res, { rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/bookings', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const classId = req.query.class_id || null;
    const params = [tenantId];
    let sql = `select * from read.rm_booking_list where tenant_id = $1`;
    if (classId) {
      params.push(classId);
      sql += ` and class_id = $2`;
    }
    sql += ` order by booked_at desc`;
    const { rows } = await query(sql, params);
    return ok(res, { rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/payments/queue', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const status = req.query.status || 'pending';
    const { rows } = await query(
      `select *
       from read.rm_payment_queue
       where tenant_id = $1 and status = $2
       order by recorded_at asc`,
      [tenantId, status]
    );
    return ok(res, { rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/pt-balance', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const memberId = req.query.member_id || null;
    const params = [tenantId];
    let sql = `select * from read.rm_pt_balance where tenant_id = $1`;
    if (memberId) {
      params.push(memberId);
      sql += ` and member_id = $2`;
    }
    sql += ` order by updated_at desc`;
    const { rows } = await query(sql, params);
    return ok(res, { rows });
  } catch (error) {
    return next(error);
  }
});

app.get('/v1/read/dashboard', async (req, res, next) => {
  try {
    const tenantId = req.query.tenant_id || config.defaultTenantId;
    const branchId = req.query.branch_id || 'core';
    const date = req.query.dashboard_date || new Date().toISOString().slice(0, 10);
    const { rows } = await query(
      `select *
       from read.rm_dashboard
       where tenant_id = $1 and branch_id = $2 and dashboard_date = $3
       limit 1`,
      [tenantId, branchId, date]
    );
    return ok(res, { row: rows[0] || null });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  return res.status(400).json({
    status: 'FAIL',
    error_code: 'BAD_REQUEST',
    message: error.message
  });
});

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`foremoz-fitness-api listening on :${config.port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
