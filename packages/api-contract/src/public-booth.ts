export type PublicBooth = {
  id: string;
  companyName: string;
  boothName: string;
  boothNumber: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
};

export type AttendeeProfileUpdate = {
  fullName: string;
  company: string;
  jobTitle: string;
  shareProfileWithExhibitors: boolean;
};
