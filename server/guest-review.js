const PHONE_LOOSE = /^[+0-9() .-]{7,25}$/;

export function registerGuestReviewRoutes(app, { pool, text, tokenHash, isEmail, normalisedPhone }) {
  const parsePayload = (body) => {
    const rating = Number(body?.rating);
    const title = text(body?.title, 100);
    const reviewBody = text(body?.body, 4000);
    const displayName = text(body?.displayName, 120);
    const email = text(body?.email, 254);
    const phone = text(body?.phone, 50);
    const consent = Boolean(body?.consent);
    return { rating, title, reviewBody, displayName, email, phone, consent };
  };

  const validatePayload = (payload) => {
    if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      return "Please select a star rating from 1 to 5.";
    }
    if (!payload.reviewBody || payload.reviewBody.length < 10) {
      return "Please write at least 10 characters about your stay.";
    }
    if (!payload.title) {
      return "Please give your review a title.";
    }
    if (!payload.displayName) {
      return "Please enter the name to display with your review.";
    }
    if (!payload.email || !isEmail(payload.email)) {
      return "Please enter a valid email address.";
    }
    const phoneNorm = payload.phone ? normalisedPhone(payload.phone) : "";
    if (!phoneNorm || !PHONE_LOOSE.test(payload.phone.trim())) {
      return "Please enter a valid contact number with country code.";
    }
    if (!payload.consent) {
      return "Please agree to publication after moderation.";
    }
    return null;
  };

  app.get("/api/review/:token", async (req, res, next) => {
    const token = text(req.params.token, 120);
    if (!token) return res.status(400).json({ error: "Invalid review link." });
    try {
      const { rows } = await pool.query(
        `select b.id, b.guest_name as "guestName", b.guest_email as "guestEmail", b.guest_phone as "guestPhone",
                b.review_submitted_at as "reviewSubmittedAt"
           from bookings b
          where b.review_token_hash = $1`,
        [tokenHash(token)],
      );
      const row = rows[0];
      if (!row) return res.status(404).json({ error: "not_found" });
      if (row.reviewSubmittedAt) return res.status(410).json({ error: "already_used" });
      res.json({
        prefill: {
          displayName: row.guestName || "",
          email: row.guestEmail || "",
          phone: row.guestPhone || "",
        },
        tokenLinked: true,
      });
    } catch (error) {
      next(error);
    }
  });

  const submitReview = async (req, res, next, token) => {
    const payload = parsePayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ error: validationError });

    const client = await pool.connect();
    try {
      await client.query("begin");
      let bookingId = null;
      if (token) {
        const { rows } = await client.query(
          `select b.id, b.review_submitted_at as "reviewSubmittedAt"
             from bookings b
            where b.review_token_hash = $1
            for update`,
          [tokenHash(token)],
        );
        const booking = rows[0];
        if (!booking) {
          await client.query("rollback");
          return res.status(404).json({ error: "This review link is not valid." });
        }
        if (booking.reviewSubmittedAt) {
          await client.query("rollback");
          return res.status(410).json({ error: "This review link has already been used." });
        }
        bookingId = booking.id;
      }

      const phoneStored = normalisedPhone(payload.phone);
      const { rows } = await client.query(
        `insert into social_entries (
            author_name, entry_type, rating, title, body, guest_email, guest_phone, booking_id,
            source, status, featured, published_at, created_by_admin_id
          ) values ($1, 'review', $2, $3, $4, $5, $6, $7, 'guest_review', 'draft', false, null, null)
          returning id`,
        [payload.displayName, payload.rating, payload.title, payload.reviewBody, payload.email, phoneStored, bookingId],
      );

      if (bookingId) {
        await client.query(
          "update bookings set review_submitted_at = now(), review_token_hash = null, updated_at = now() where id = $1",
          [bookingId],
        );
      }

      await client.query("commit");
      res.status(201).json({ ok: true, id: rows[0].id });
    } catch (error) {
      await client.query("rollback").catch(() => {});
      next(error);
    } finally {
      client.release();
    }
  };

  app.post("/api/review/:token", (req, res, next) => {
    const token = text(req.params.token, 120);
    if (!token) return res.status(400).json({ error: "Invalid review link." });
    return submitReview(req, res, next, token);
  });

  app.post("/api/review", (req, res, next) => submitReview(req, res, next, null));
}