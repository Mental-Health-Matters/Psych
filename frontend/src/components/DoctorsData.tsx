
import { Doctor } from './Types'

export const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "atharwatp@gmail.com",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800",
    specialization: "Clinical Psychiatrist",
    experience: "15 years",
    location: "Manhattan Medical Center, NY",
    rating: 4.8,
    homeVisit: true,
    onlineConsult: true,
    languages: ["English", "Spanish"],
    fee: 200,
    nextAvailable: "Today",
    education: [
      "MD in Psychiatry, Harvard Medical School",
      "Fellowship in Child Psychiatry, Johns Hopkins"
    ],
    about: "Dr. Johnson specializes in anxiety, depression, and trauma therapy. With 15 years of experience, she takes a holistic approach to mental health treatment.",
    clinicPhotos: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800"
    ],
    availability: {
      "Monday": ["09:00 AM", "11:00 AM", "02:00 PM"],
      "Tuesday": ["10:00 AM", "03:00 PM", "04:00 PM"],
      "Wednesday": ["09:00 AM", "01:00 PM", "05:00 PM"]
    }
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    email: "atharwatp@gmail.com",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800",
    specialization: "Child Psychiatrist",
    experience: "12 years",
    location: "Wellness Center, Boston",
    rating: 4.9,
    homeVisit: false,
    onlineConsult: true,
    languages: ["English", "Mandarin"],
    fee: 180,
    nextAvailable: "Tomorrow",
    education: [
      "MD in Psychiatry, Stanford University",
      "Specialization in Child Psychology, UCLA"
    ],
    about: "Dr. Chen is a leading child psychiatrist with expertise in ADHD, autism spectrum disorders, and developmental challenges.",
    clinicPhotos: [
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1631217868274-e5b90bb7e133?auto=format&fit=crop&w=800"
    ],
    availability: {
      "Monday": ["10:00 AM", "02:00 PM"],
      "Wednesday": ["09:00 AM", "03:00 PM"],
      "Friday": ["11:00 AM", "04:00 PM"]
    }
  }
];
