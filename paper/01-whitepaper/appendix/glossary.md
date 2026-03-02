# Glossary

- namespace: tenant-isolated event domain identifier (`foremoz:fitness:<tenant_id>`).
- chain: stream partition in namespace (`branch:<branch_id>` or `core`).
- event: immutable record appended to EventDB write layer.
- projection: process that materializes read model from ordered events.
- read model: query-optimized table/view for UI and reports.
- tenant: gym/studio business account.
- branch: location/operation unit under tenant.
- subscription: time-bound membership entitlement.
- booking: reservation slot for class or PT session.
- PT session: personal training session unit.
- public account page: `fitness.foremoz.com/a/<account>` promotional page.
- prospect: calon member tracked by sales pipeline.
