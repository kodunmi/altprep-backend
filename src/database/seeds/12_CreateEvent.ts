import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Event } from '@api/models/Event';
import { EventCategoryEnum } from '@base/api/interfaces/event/EventInterface';

export default class EventSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const eventsData = [
      {
        title: 'AI & Machine Learning Bootcamp',
        description: `
          Join us for an immersive deep dive into Artificial Intelligence and Machine Learning.
          This bootcamp covers Neural Networks, Deep Learning, NLP, Reinforcement Learning, 
          Computer Vision, Model Optimization, and real-world deployment strategies.
          Whether you're a beginner or intermediate developer, this event will help you level up 
          your skills with hands-on sessions and expert guidance. 
          Expect workshops, coding labs, panel discussions, and networking opportunities 
          with industry professionals. This is one of the most comprehensive AI experiences 
          available for upcoming tech talents!
        `,
        type: 'physical',
        location: 'Lagos, Nigeria',
        organization: 'TechHub Africa',
        category: EventCategoryEnum.EVENTS,
        start_time: '2025-12-10 10:00:00',
        event_date: "2026-01-15",
        meta: JSON.stringify({
          speakers: [
            { name: 'Dr. Ada Onyema', topic: 'Neural Networks & Deep Learning' },
            { name: 'Prof. Daniel Wright', topic: 'Practical ML Deployment' },
          ],
        }),
      },
      {
        title: 'Frontend Developer Internship 2025',
        description: `
          A fully immersive internship for aspiring frontend engineers. 
          Participants will work with modern tools such as React, Vue, TypeScript, 
          TailwindCSS, Webpack and Vite.  
          The internship includes mentorship sessions, real company projects, 
          UI/UX fundamentals, code reviews, and career development classes.
          This is a rare opportunity to gain real industry experience with 
          top-tier engineering teams and collaborating with highly skilled developers.
          Perfect for junior developers preparing for real-world challenges!
        `,
        type: 'virtual',
        location: 'Online',
        organization: 'Innovate DevLabs',
        category: EventCategoryEnum.INTERNSHIPS,
        start_time: '2025-11-28 14:00:00',
        event_date: "2026-01-15",
      },
      {
        title: 'Global Hackathon Challenge 2025',
        description: `
          Compete with developers across the world in a 48-hour hackathon 
          featuring challenges in AI, web development, cybersecurity, 
          blockchain, and cloud computing.  
          Participants will form teams, build solutions rapidly, 
          pitch to judges, and win various prizes including cash, tech gadgets, 
          and mentorship opportunities.
          This event encourages creativity, teamwork, problem solving, 
          and high-pressure delivery — the real traits of elite engineers.
          Register now to be part of one of the biggest hackathons of 2025!
        `,
        type: 'physical',
        location: 'Abuja, Nigeria',
        organization: 'CodeFest International',
        category: EventCategoryEnum.COMPETITIONS,
        start_time: '2026-01-15 09:00:00',
        event_date: "2026-01-15",
        meta: JSON.stringify({
          speakers: [
            { name: 'Elena Garcia', topic: 'Building for Scale' },
            { name: 'Michael Zhang', topic: 'Rapid Prototyping Best Practices' },
          ],
        }),
      },
    ];

    await connection
      .createQueryBuilder()
      .insert()
      .into(Event)
      .values(eventsData)
      .execute();
  }
}
