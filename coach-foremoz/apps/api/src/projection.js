import { resolveChainId, resolveNamespaceId } from './event-store.js';
import { withTx } from './db.js';

const PROJECTOR_NAME = 'coach_v1';

function j(value) {
  return JSON.stringify(value ?? null);
}

function d(value) {
  return String(value || '').slice(0, 10);
}

export async function runCoachProjection({ tenantId, branchId }) {
  const namespaceId = resolveNamespaceId(tenantId);
  const chainId = resolveChainId(branchId);

  return withTx(async (client) => {
    await client.query(
      `insert into read.rm_checkpoint (projector_name, namespace_id, chain_id, last_sequence)
       values ($1, $2, $3, 0)
       on conflict (projector_name, namespace_id, chain_id) do nothing`,
      [PROJECTOR_NAME, namespaceId, chainId]
    );

    const { rows: cpRows } = await client.query(
      `select last_sequence
       from read.rm_checkpoint
       where projector_name = $1 and namespace_id = $2 and chain_id = $3
       for update`,
      [PROJECTOR_NAME, namespaceId, chainId]
    );

    const lastSequence = Number(cpRows[0]?.last_sequence || 0);
    const { rows: events } = await client.query(
      `select sequence, event_type, event_time, payload
       from eventdb_event
       where namespace_id = $1 and chain_id = $2 and sequence > $3
       order by sequence asc`,
      [namespaceId, chainId, lastSequence]
    );

    let applied = 0;
    let maxSeq = lastSequence;

    for (const evt of events) {
      const data = evt.payload?.data || {};
      const ts = data.updated_at || data.created_at || evt.payload?.ts || evt.event_time;
      const tenant = data.tenant_id || tenantId;

      if (evt.event_type === 'coach.profile.published') {
        await client.query(
          `insert into read.rm_coach_profile_public
             (tenant_id, coach_id, coach_handle, display_name, bio, status, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7)
           on conflict (tenant_id, coach_id) do update set
             coach_handle = excluded.coach_handle,
             display_name = excluded.display_name,
             bio = excluded.bio,
             status = excluded.status,
             updated_at = excluded.updated_at`,
          [tenant, data.coach_id, data.coach_handle, data.display_name, data.bio || null, data.status || 'active', ts]
        );
      } else if (evt.event_type === 'coach.offer.published') {
        await client.query(
          `insert into read.rm_coach_offer_catalog
             (tenant_id, offer_id, coach_id, offer_name, price_amount, status, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7)
           on conflict (tenant_id, offer_id) do update set
             coach_id = excluded.coach_id,
             offer_name = excluded.offer_name,
             price_amount = excluded.price_amount,
             status = excluded.status,
             updated_at = excluded.updated_at`,
          [tenant, data.offer_id, data.coach_id, data.offer_name, Number(data.price_amount || 0), data.status || 'active', ts]
        );
      } else if (evt.event_type === 'coach.microsite.link.shared') {
        await client.query(
          `insert into read.rm_subscription_funnel
             (tenant_id, funnel_id, coach_id, source_channel, share_count, click_count, subscribe_count, booking_count, updated_at)
           values ($1,$2,$3,$4,1,0,0,0,$5)
           on conflict (tenant_id, funnel_id) do update set
             share_count = read.rm_subscription_funnel.share_count + 1,
             updated_at = excluded.updated_at`,
          [tenant, data.share_id, data.coach_id, data.channel || 'direct', ts]
        );
      } else if (evt.event_type === 'coach.campaign.clicked') {
        await client.query(
          `insert into read.rm_subscription_funnel
             (tenant_id, funnel_id, coach_id, source_channel, share_count, click_count, subscribe_count, booking_count, updated_at)
           values ($1,$2,$3,$4,0,1,0,0,$5)
           on conflict (tenant_id, funnel_id) do update set
             click_count = read.rm_subscription_funnel.click_count + 1,
             updated_at = excluded.updated_at`,
          [tenant, data.share_id || data.click_id, data.coach_id, data.channel || 'direct', ts]
        );
      } else if (evt.event_type === 'subscription.created') {
        const perfDate = d(ts);
        await client.query(
          `insert into read.rm_coach_performance
             (tenant_id, coach_id, performance_date, new_subscriber_count, class_occupancy_rate, retention_rate, updated_at)
           values ($1,$2,$3,1,0,0,$4)
           on conflict (tenant_id, coach_id, performance_date) do update set
             new_subscriber_count = read.rm_coach_performance.new_subscriber_count + 1,
             updated_at = excluded.updated_at`,
          [tenant, data.coach_id, perfDate, ts]
        );
      } else if (evt.event_type === 'class.scheduled' || evt.event_type === 'location.class.assigned') {
        await client.query(
          `insert into read.rm_location_class_list
             (tenant_id, class_id, coach_id, location_id, studio_id, start_at, capacity, booked_count, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,0,$8)
           on conflict (tenant_id, class_id) do update set
             coach_id = excluded.coach_id,
             location_id = excluded.location_id,
             studio_id = excluded.studio_id,
             start_at = excluded.start_at,
             capacity = excluded.capacity,
             updated_at = excluded.updated_at`,
          [tenant, data.class_id, data.coach_id, data.location_id, data.studio_id || null, data.start_at || ts, Number(data.capacity || 0), ts]
        );
      } else if (evt.event_type === 'class.booking.created') {
        await client.query(
          `update read.rm_location_class_list
           set booked_count = booked_count + 1,
               updated_at = $3
           where tenant_id = $1 and class_id = $2`,
          [tenant, data.class_id, ts]
        );
      } else if (evt.event_type === 'class.booking.canceled') {
        await client.query(
          `update read.rm_location_class_list
           set booked_count = greatest(booked_count - 1, 0),
               updated_at = $3
           where tenant_id = $1 and class_id = $2`,
          [tenant, data.class_id, ts]
        );
      } else if (evt.event_type === 'invitation.sent' || evt.event_type === 'invitation.accepted' || evt.event_type === 'invitation.rejected') {
        await client.query(
          `insert into read.rm_invitation_queue
             (tenant_id, invitation_id, inviter_actor_kind, invitee_actor_kind, target_contact, channel, status, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8)
           on conflict (tenant_id, invitation_id) do update set
             status = excluded.status,
             updated_at = excluded.updated_at`,
          [
            tenant,
            data.invitation_id,
            data.inviter_actor_kind || 'coach',
            data.invitee_actor_kind || 'member',
            data.target_contact || null,
            data.channel || null,
            data.status || 'pending',
            ts
          ]
        );
      } else if (evt.event_type === 'coach.member.linked' || evt.event_type === 'coach.studio.linked') {
        await client.query(
          `insert into read.rm_actor_network
             (tenant_id, relation_id, left_actor_kind, left_actor_id, right_actor_kind, right_actor_id, status, source_invitation_id, updated_at)
           values ($1,$2,$3,$4,$5,$6,'active',$7,$8)
           on conflict (tenant_id, relation_id) do update set
             status = 'active',
             updated_at = excluded.updated_at`,
          [
            tenant,
            data.relation_id,
            data.left_actor_kind,
            data.left_actor_id,
            data.right_actor_kind,
            data.right_actor_id,
            data.source_invitation_id || null,
            ts
          ]
        );
      } else if (evt.event_type === 'coach.team.member.added') {
        await client.query(
          `insert into read.rm_support_team
             (tenant_id, team_member_id, coach_id, role_name, location_scope, is_active, updated_at)
           values ($1,$2,$3,$4,$5,true,$6)
           on conflict (tenant_id, team_member_id) do update set
             role_name = excluded.role_name,
             location_scope = excluded.location_scope,
             is_active = true,
             updated_at = excluded.updated_at`,
          [tenant, data.team_member_id, data.coach_id, data.role_name || 'cs', j(data.location_scope), ts]
        );
      } else if (evt.event_type === 'coach.team.member.removed') {
        await client.query(
          `update read.rm_support_team
           set is_active = false, updated_at = $3
           where tenant_id = $1 and team_member_id = $2`,
          [tenant, data.team_member_id, ts]
        );
      } else if (evt.event_type === 'pricing.plan.changed' || evt.event_type === 'billing.subscription.updated') {
        await client.query(
          `insert into read.rm_pricing_plan_state
             (tenant_id, coach_id, plan_code, plan_status, effective_at, updated_at)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (tenant_id, coach_id) do update set
             plan_code = excluded.plan_code,
             plan_status = excluded.plan_status,
             effective_at = excluded.effective_at,
             updated_at = excluded.updated_at`,
          [tenant, data.coach_id, data.plan_code || 'free', data.plan_status || 'active', data.effective_at || ts, ts]
        );
      }

      applied += 1;
      maxSeq = Number(evt.sequence);
    }

    await client.query(
      `update read.rm_checkpoint
       set last_sequence = $4, updated_at = now()
       where projector_name = $1 and namespace_id = $2 and chain_id = $3`,
      [PROJECTOR_NAME, namespaceId, chainId, maxSeq]
    );

    return { applied, last_sequence: maxSeq };
  });
}
