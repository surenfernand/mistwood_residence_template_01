const SLEEPING_ROWS = [
  {
    space: "Triple room",
    bed: "1 triple bed",
    bath: "Attached bathroom",
    icon: "bed-double",
  },
  {
    space: "Double room (1)",
    bed: "1 double bed",
    bath: "Shared bathroom",
    icon: "bed-double",
  },
  {
    space: "Double room (2)",
    bed: "1 double bed",
    bath: "Shared bathroom",
    icon: "bed-double",
  },
  {
    space: "Servant room",
    bed: "1 single bed",
    bath: "Single toilet (no full bathroom)",
    icon: "bed-single",
  },
];

const HIGHLIGHTS = [
  "The entire apartment is rented as one unit for private use.",
  "3 sleeping rooms plus a servant room with a single bed.",
  "Triple room has an attached bathroom; both double rooms share a common bathroom.",
  "Maximum adult capacity is 8 guests when including the servant room.",
  "Well suited for families and small groups.",
];

function RowIcon({ name }) {
  if (name === "bed-single") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18v-8h16v8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 14h16M7 10V8.5A2 2 0 0 1 9 6.5h6a2 2 0 0 1 2 2V10" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 18v-6h18v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 14h18M6 14V9h5v5M13 14V9h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function ApartmentSleepingArrangements({ propertyName }) {
  return (
    <section className="apt-sleeping" aria-labelledby="apt-sleeping-title">
      <div className="mh-wrap">
        <article className="apt-sleeping-card">
          <img
            className="apt-sleeping-leaf"
            src="/assets/mistwood/decorations/leaf-branch.png"
            alt=""
            aria-hidden="true"
          />
          <header className="apt-sleeping-head">
            <p className="apt-sleeping-kicker">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 18v-6h18v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3 14h18M6 14V9h5v5M13 14V9h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Rooms &amp; bathrooms
            </p>
            <h2 id="apt-sleeping-title">Sleeping Arrangements</h2>
            <p>
              A comfortable layout for families and groups at {propertyName} — one triple room, two doubles, and a
              servant room with a single bed.
            </p>
          </header>

          <div className="apt-sleeping-layout">
            <div className="apt-sleeping-table-wrap">
              <table className="apt-sleeping-table">
                <thead>
                  <tr>
                    <th scope="col">Space</th>
                    <th scope="col">Bed configuration</th>
                    <th scope="col">Bathroom</th>
                  </tr>
                </thead>
                <tbody>
                  {SLEEPING_ROWS.map((row) => (
                    <tr key={row.space}>
                      <th scope="row">{row.space}</th>
                      <td>
                        <span className="apt-sleeping-bed">
                          <RowIcon name={row.icon} />
                          {row.bed}
                        </span>
                      </td>
                      <td>{row.bath}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="apt-sleeping-aside" aria-labelledby="apt-sleeping-aside-title">
              <h3 id="apt-sleeping-aside-title">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 11.5 12 5l7 6.5V20a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20v-8.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                Important to know
              </h3>
              <ul>
                {HIGHLIGHTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </article>
      </div>
    </section>
  );
}
