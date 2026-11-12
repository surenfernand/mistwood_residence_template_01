insert into permissions (code, label) values ('users', 'Users & Permissions')
on conflict (code) do nothing;

-- Owner: full access
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p
where r.name = 'Owner'
on conflict do nothing;

-- Manager: operations (no users, settings)
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code in (
  'dashboard', 'bookings', 'availability', 'rates', 'payments', 'guests', 'reports'
)
where r.name = 'Manager'
on conflict do nothing;

-- Booking Staff
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code in ('dashboard', 'bookings', 'guests')
where r.name = 'Booking Staff'
on conflict do nothing;

-- Housekeeping
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r join permissions p on p.code in ('dashboard', 'availability', 'bookings')
where r.name = 'Housekeeping'
on conflict do nothing;

-- Ensure every admin without a role gets Owner (bootstrap / legacy accounts)
insert into admin_role_assignments (admin_id, role_id)
select a.id, r.id from admins a
cross join roles r
where r.name = 'Owner'
  and not exists (select 1 from admin_role_assignments x where x.admin_id = a.id)
on conflict (admin_id) do nothing;

-- Relax legacy admins.role column (source of truth is admin_role_assignments)
alter table admins drop constraint if exists admins_role_check;
alter table admins add constraint admins_role_check check (role in ('admin', 'owner'));
