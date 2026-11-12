const COLOMBO = "Asia/Colombo";

function permissionAllowed(admin, permissionCode) {
  const roleName = admin.roleName || "Owner";
  const legacyOwner = !admin.permissions?.length && (roleName === "Owner" || roleName === "admin");
  if (legacyOwner) return true;
  return (admin.permissions || []).includes(permissionCode);
}

function formatDay(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function nightsBetween(arrive, depart) {
  const a = new Date(`${formatDay(arrive)}T00:00:00Z`);
  const d = new Date(`${formatDay(depart)}T00:00:00Z`);
  const diff = Math.round((d - a) / (24 * 60 * 60 * 1000));
  return diff > 0 ? diff : 1;
}

function formatDateLabel(value) {
  const day = formatDay(value);
  if (!day) return "—";
  const parsed = new Date(`${day}T00:00:00+05:30`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: COLOMBO,
  }).format(parsed);
}

function formatDateRange(arrive, depart) {
  return `${formatDateLabel(arrive)} – ${formatDateLabel(depart)}`;
}

function formatLkr(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "LKR 0";
  return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(n);
}

export async function createAdminNotification(pool, payload) {
  const {
    type,
    permissionCode,
    title,
    body,
    icon = "bell",
    entityType = null,
    entityId = null,
    metadata = {},
  } = payload;
  if (!type || !permissionCode || !title || !body) return null;

  if (entityId != null) {
    const { rows } = await pool.query(
      `select id from admin_notification_events
        where type = $1 and entity_type is not distinct from $2 and entity_id = $3
          and created_at > now() - interval '1 hour'
        limit 1`,
      [type, entityType, entityId],
    );
    if (rows.length) return rows[0].id;
  }

  const { rows } = await pool.query(
    `insert into admin_notification_events (type, permission_code, title, body, icon, entity_type, entity_id, metadata)
     values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     returning id`,
    [type, permissionCode, title, body, icon, entityType, entityId, JSON.stringify(metadata)],
  );
  return rows[0]?.id ?? null;
}

export async function notifyBookingRequestNew(pool, request) {
  const nights = nightsBetween(request.arrive, request.depart);
  const nightLabel = nights === 1 ? "1-night" : `${nights}-night`;
  return createAdminNotification(pool, {
    type: "booking_request.new",
    permissionCode: "bookings",
    title: "New booking request",
    body: `A ${nightLabel} stay for ${formatDateRange(request.arrive, request.depart)} has been requested.`,
    icon: "calendar",
    entityType: "booking_request",
    entityId: request.id,
    metadata: { href: `/admin/booking-requests?open=${request.id}` },
  });
}

export async function notifyEnquiryNew(pool, enquiry) {
  const subjectHint = enquiry.subject ? ` about ${enquiry.subject}` : "";
  return createAdminNotification(pool, {
    type: "enquiry.new",
    permissionCode: "guests",
    title: "Guest enquiry received",
    body: `A new enquiry from ${enquiry.name}${subjectHint}.`,
    icon: "mail",
    entityType: "enquiry",
    entityId: enquiry.id,
    metadata: { href: "/admin/guests-enquiries" },
  });
}

export async function notifyPaymentReceived(pool, { bookingId, amount, guestName }) {
  return createAdminNotification(pool, {
    type: "payment.received",
    permissionCode: "payments",
    title: "Payment received",
    body: `A payment of ${formatLkr(amount)} has been received for booking #${bookingId}.`,
    icon: "card",
    entityType: "booking",
    entityId: bookingId,
    metadata: { href: "/admin/payments" },
  });
}

export async function notifyDepositPending(pool, requestId) {
  return createAdminNotification(pool, {
    type: "payment.deposit_pending",
    permissionCode: "payments",
    title: "Deposit awaiting verification",
    body: `Deposit awaiting verification for BR-${requestId}.`,
    icon: "card",
    entityType: "booking_request",
    entityId: requestId,
    metadata: { href: `/admin/booking-requests?open=${requestId}` },
  });
}

export async function notifyBookingConfirmed(pool, { requestId, guestName, arrive, depart }) {
  return createAdminNotification(pool, {
    type: "booking.confirmed",
    permissionCode: "bookings",
    title: "Stay confirmed",
    body: `Stay confirmed for ${guestName}, ${formatDateRange(arrive, depart)}.`,
    icon: "calendar",
    entityType: "booking_request",
    entityId: requestId,
    metadata: { href: "/admin/booking-requests" },
  });
}

export async function notifyNeedsAttention(pool, requestId) {
  return createAdminNotification(pool, {
    type: "booking.needs_attention",
    permissionCode: "bookings",
    title: "Booking needs follow-up",
    body: `Booking BR-${requestId} flagged for follow-up.`,
    icon: "calendar",
    entityType: "booking_request",
    entityId: requestId,
    metadata: { href: `/admin/booking-requests?open=${requestId}` },
  });
}

export async function notifyUserInvited(pool, { adminId, name, roleName }) {
  return createAdminNotification(pool, {
    type: "team.user_invited",
    permissionCode: "users",
    title: "Team member invited",
    body: `${name} invited as ${roleName}.`,
    icon: "user",
    entityType: "admin",
    entityId: adminId,
    metadata: { href: "/admin/users" },
  });
}

export async function notifyUserDeactivated(pool, { adminId, name }) {
  return createAdminNotification(pool, {
    type: "team.user_deactivated",
    permissionCode: "users",
    title: "Admin access deactivated",
    body: `${name}'s admin access was deactivated.`,
    icon: "user",
    entityType: "admin",
    entityId: adminId,
    metadata: { href: "/admin/users" },
  });
}

export async function notifyAvailabilityBlock(pool, { blockId, startDate, endDate, reason }) {
  const range = formatDateRange(startDate, endDate);
  const reasonText = reason ? ` (${reason})` : "";
  return createAdminNotification(pool, {
    type: "availability.block",
    permissionCode: "availability",
    title: "Dates blocked",
    body: `Dates blocked: ${range}${reasonText}.`,
    icon: "block",
    entityType: "availability_block",
    entityId: blockId,
    metadata: { href: "/admin/availability" },
  });
}

async function fetchSyntheticReminders(pool, admin) {
  if (!permissionAllowed(admin, "bookings")) return [];

  const { rows } = await pool.query(
    `select b.id, b.guest_name as "guestName", b.check_in::text as "checkIn", b.check_out::text as "checkOut"
       from bookings b
      where b.status in ('confirmed', 'checked_in')
        and (
          b.check_in in (
            (timezone($1, now()))::date,
            (timezone($1, now()))::date + 1
          )
          or b.check_out in (
            (timezone($1, now()))::date,
            (timezone($1, now()))::date + 1
          )
        )
      order by b.check_in`,
    [COLOMBO],
  );

  const todaySql = await pool.query(`select (timezone($1, now()))::date::text as d`, [COLOMBO]);
  const today = todaySql.rows[0].d;
  const tomorrowRow = await pool.query(`select ((timezone($1, now()))::date + 1)::text as d`, [COLOMBO]);
  const tomorrow = tomorrowRow.rows[0].d;

  const items = [];
  for (const row of rows) {
    const nights = nightsBetween(row.checkIn, row.checkOut);
    const nightLabel = nights === 1 ? "1-night" : `${nights}-night`;

    if (row.checkIn === tomorrow) {
      items.push({
        syntheticKey: `stay.check_in_tomorrow:${row.id}:${tomorrow}`,
        type: "stay.check_in_tomorrow",
        permissionCode: "bookings",
        title: "Check-in tomorrow",
        body: `${row.guestName} is checking in tomorrow (${formatDateLabel(row.checkIn)}) for a ${nightLabel} stay.`,
        icon: "bed",
        createdAt: new Date().toISOString(),
        metadata: { href: "/admin/bookings/today" },
      });
    }
    if (row.checkIn === today) {
      items.push({
        syntheticKey: `stay.arrival_today:${row.id}:${today}`,
        type: "stay.arrival_today",
        permissionCode: "bookings",
        title: "Arrival today",
        body: `${row.guestName} arrives today.`,
        icon: "bed",
        createdAt: new Date().toISOString(),
        metadata: { href: "/admin/bookings/today" },
      });
    }
    if (row.checkOut === today) {
      items.push({
        syntheticKey: `stay.departure_today:${row.id}:${today}`,
        type: "stay.departure_today",
        permissionCode: "bookings",
        title: "Departure today",
        body: `${row.guestName} departs today.`,
        icon: "bed",
        createdAt: new Date().toISOString(),
        metadata: { href: "/admin/bookings/today" },
      });
    }
    if (row.checkOut === tomorrow) {
      items.push({
        syntheticKey: `stay.check_out_tomorrow:${row.id}:${tomorrow}`,
        type: "stay.check_out_tomorrow",
        permissionCode: "bookings",
        title: "Check-out tomorrow",
        body: `Turnover: ${row.guestName} checks out tomorrow.`,
        icon: "bed",
        createdAt: new Date().toISOString(),
        metadata: { href: "/admin/bookings/today" },
      });
    }
  }
  return items;
}

function mapEventRow(row) {
  return {
    id: String(row.id),
    eventId: row.id,
    synthetic: false,
    type: row.type,
    permissionCode: row.permission_code,
    title: row.title,
    body: row.body,
    icon: row.icon,
    createdAt: row.created_at,
    read: Boolean(row.read_at),
    metadata: row.metadata || {},
  };
}

function mapSyntheticRow(row, dismissed) {
  return {
    id: `syn:${row.syntheticKey}`,
    syntheticKey: row.syntheticKey,
    synthetic: true,
    type: row.type,
    permissionCode: row.permissionCode,
    title: row.title,
    body: row.body,
    icon: row.icon,
    createdAt: row.createdAt,
    read: dismissed,
    metadata: row.metadata || {},
  };
}

export async function listAdminNotifications(pool, admin, { limit = 20, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
  const safeOffset = Math.max(Number.parseInt(offset, 10) || 0, 0);

  const { rows: events } = await pool.query(
    `select e.id, e.type, e.permission_code, e.title, e.body, e.icon, e.metadata, e.created_at,
            r.read_at
       from admin_notification_events e
       left join admin_notification_reads r on r.event_id = e.id and r.admin_id = $1
      order by e.created_at desc
      limit 500`,
    [admin.id],
  );

  const filteredEvents = events
    .filter((row) => permissionAllowed(admin, row.permission_code))
    .map(mapEventRow);

  const syntheticRaw = await fetchSyntheticReminders(pool, admin);
  const { rows: dismissals } = await pool.query(
    "select synthetic_key from admin_notification_dismissals where admin_id = $1",
    [admin.id],
  );
  const dismissedSet = new Set(dismissals.map((d) => d.synthetic_key));
  const synthetic = syntheticRaw
    .filter((row) => permissionAllowed(admin, row.permissionCode))
    .map((row) => mapSyntheticRow(row, dismissedSet.has(row.syntheticKey)));

  const merged = [...synthetic, ...filteredEvents].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const unreadCount = merged.filter((item) => !item.read).length;
  const page = merged.slice(safeOffset, safeOffset + safeLimit);

  return {
    notifications: page,
    unreadCount,
    total: merged.length,
    limit: safeLimit,
    offset: safeOffset,
  };
}

export async function markNotificationRead(pool, admin, rawId) {
  const id = String(rawId || "");
  if (id.startsWith("syn:")) {
    const syntheticKey = id.slice(4);
    const reminders = await fetchSyntheticReminders(pool, admin);
    const match = reminders.find((r) => r.syntheticKey === syntheticKey);
    if (!match || !permissionAllowed(admin, match.permissionCode)) {
      return { ok: false, status: 404 };
    }
    await pool.query(
      `insert into admin_notification_dismissals (admin_id, synthetic_key) values ($1, $2)
       on conflict (admin_id, synthetic_key) do update set dismissed_at = now()`,
      [admin.id, syntheticKey],
    );
    return { ok: true };
  }

  const eventId = Number.parseInt(id, 10);
  if (!Number.isSafeInteger(eventId) || eventId < 1) return { ok: false, status: 400 };

  const { rows } = await pool.query(
    "select id, permission_code from admin_notification_events where id = $1",
    [eventId],
  );
  const event = rows[0];
  if (!event) return { ok: false, status: 404 };
  if (!permissionAllowed(admin, event.permission_code)) return { ok: false, status: 403 };

  await pool.query(
    `insert into admin_notification_reads (admin_id, event_id) values ($1, $2)
     on conflict (admin_id, event_id) do update set read_at = now()`,
    [admin.id, eventId],
  );
  return { ok: true };
}

export async function markAllNotificationsRead(pool, admin) {
  const { rows: events } = await pool.query("select id, permission_code from admin_notification_events");
  const eventIds = events.filter((e) => permissionAllowed(admin, e.permission_code)).map((e) => e.id);

  const syntheticRaw = await fetchSyntheticReminders(pool, admin);
  const syntheticKeys = syntheticRaw
    .filter((row) => permissionAllowed(admin, row.permissionCode))
    .map((row) => row.syntheticKey);

  if (eventIds.length) {
    await pool.query(
      `insert into admin_notification_reads (admin_id, event_id)
       select $1, unnest($2::bigint[])
       on conflict (admin_id, event_id) do update set read_at = now()`,
      [admin.id, eventIds],
    );
  }

  for (const key of syntheticKeys) {
    await pool.query(
      `insert into admin_notification_dismissals (admin_id, synthetic_key) values ($1, $2)
       on conflict (admin_id, synthetic_key) do update set dismissed_at = now()`,
      [admin.id, key],
    );
  }

  return { ok: true, marked: eventIds.length + syntheticKeys.length };
}

export function adminHasNotificationPermission(admin, permissionCode) {
  return permissionAllowed(admin, permissionCode);
}
