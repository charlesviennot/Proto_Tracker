import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import * as ics from "ics";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // API Route to generate the .ics calendar feed
  app.get("/api/calendar.ics", async (req, res) => {
    try {
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const events: ics.EventAttributes[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const id = data.id;
        const name = data.name || 'Inconnu';
        const code = data.code || '';
        const group = data.group || '';
        
        // Day 0
        if (data.day0?.date) {
          const date = new Date(data.day0.date);
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          let hours = 9;
          let minutes = 0;
          
          if (data.day0.time) {
            const [h, m] = data.day0.time.split(':');
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
          }
          
          events.push({
            title: `[J0] ${name} (${code})`,
            description: `Sujet: ${name}\nCode: ${code}\nGroupe: ${group}\nSession: J0 (Baseline)`,
            start: [year, month, day, hours, minutes],
            duration: { hours: 1 },
            uid: `${id}-j0@audiovitality.local`
          });
        }
        
        // Day 1
        if (data.day1?.date) {
          const date = new Date(data.day1.date);
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          let hours = 9;
          let minutes = 0;
          
          if (data.day1.time) {
            const [h, m] = data.day1.time.split(':');
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
          }
          
          events.push({
            title: `[J1] ${name} (${code})`,
            description: `Sujet: ${name}\nCode: ${code}\nGroupe: ${group}\nSession: J1 (Suivi 24h)`,
            start: [year, month, day, hours, minutes],
            duration: { hours: 0, minutes: 30 },
            uid: `${id}-j1@audiovitality.local`
          });
        }
        
        // Day 2
        if (data.day2?.date) {
          const date = new Date(data.day2.date);
          let year = date.getFullYear();
          let month = date.getMonth() + 1;
          let day = date.getDate();
          let hours = 9;
          let minutes = 0;
          
          if (data.day2.time) {
            const [h, m] = data.day2.time.split(':');
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
          }
          
          events.push({
            title: `[J2] ${name} (${code})`,
            description: `Sujet: ${name}\nCode: ${code}\nGroupe: ${group}\nSession: J2 (Suivi 48h & Récup)`,
            start: [year, month, day, hours, minutes],
            duration: { hours: 1 },
            uid: `${id}-j2@audiovitality.local`
          });
        }
      });
      
      if (events.length === 0) {
        // Return an empty calendar if no events
        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=\"audiovitality.ics\"");
        return res.send("BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AudioVitality//Clinical Tracker//FR\nEND:VCALENDAR");
      }

      ics.createEvents(events, (error, value) => {
        if (error) {
          console.error("Error generating ICS:", error);
          res.status(500).send("Error generating calendar");
          return;
        }
        
        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=\"audiovitality.ics\"");
        res.send(value);
      });
      
    } catch (error) {
      console.error("Calendar API Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
