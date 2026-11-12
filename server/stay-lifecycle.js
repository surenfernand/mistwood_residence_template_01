const COLOMBO = "Asia/Colombo";

function todayColombo(pool) {
  return pool.query("select (now() at time zone $1)::date::text as day", [COLOMBO]).then((r) => r.rows[0]?.day || "");
}

export async function runStayLifecycleJob(pool) {
  const day = await todayColombo(pool);
  if (!day) return { checkedOut: 0, autoClosed: 0 };

  const client = await pool.connect();
  try {
    await client.query("begin");

    const checkedIn = await client.query(
      `update bookings b
          set status = 'checked_out', updated_at = now()
        where b.status = 'checked_in' and b.check_out < $1::date
      returning b.id, b.booking_request_id`,
      [day],
    );

    const confirmedPast = await client.query(
      `update bookings b
          set status = 'checked_out', updated_at = now()
        where b.status = 'confirmed' and b.check_out < $1::date
      returning b.id, b.booking_request_id`,
      [day],
    );

    const all = [...checkedIn.rows, ...confirmedPast.rows];
    for (const row of all) {
      if (row.booking_request_id) {
        await client.query(
          "update booking_requests set status = 'checked_out', status_changed_at = now(), updated_at = now() where id = $1 and status in ('confirmed', 'checked_in')",
          [row.booking_request_id],
        );
      }
    }

    await client.query("commit");
    return { checkedOut: checkedIn.rowCount, autoClosed: confirmedPast.rowCount };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export function scheduleStayLifecycle(pool) {
  const run = () => {
    runStayLifecycleJob(pool).then((result) => {
      if (result.checkedOut || result.autoClosed) {
        console.log(`Stay lifecycle: ${result.checkedOut} checked-out, ${result.autoClosed} auto-closed confirmed stays`);
      }
    }).catch((error) => console.error("Stay lifecycle job failed:", error.message));
  };
  run();
  const dayMs = 24 * 60 * 60 * 1000;
  setInterval(run, dayMs);
}
