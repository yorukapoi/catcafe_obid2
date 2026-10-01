export type StaffStatus = 'pending' | 'approved' | 'rejected';

export interface StaffProfile {
  id: string;
  user_id: string;
  email: string;
  status: StaffStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  role: 'staff' | 'manager';
}

export type MenuCategory = 'coffee' | 'pastry' | 'tea' | 'vegan';
export type DietaryTag = 'Gluten-Free' | 'Vegan' | 'Nut-Free' | 'Dairy-Free' | 'Vegetarian';
export type CatStatus = 'available' | 'resident' | 'pending' | 'adopted';
export type ApplicationStatus = 'under_review' | 'approved' | 'archived';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  name_mk: string;
  description_mk: string;
  price: number;
  image_url: string;
  category: MenuCategory;
  dietary_tags: DietaryTag[];
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Cat {
  id: string;
  name: string;
  age: string;
  breed: string;
  bio: string;
  image_url: string;
  gallery_urls: string[];
  status: CatStatus;
  favorite_toys: string[];
  good_with_kids: boolean;
  good_with_pets: boolean;
  backstory: string;
  bio_mk: string;
  backstory_mk: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdoptionApplication {
  id: string;
  applicant_name: string;
  email: string;
  phone: string;
  address: string;
  housing_type: 'rent' | 'own';
  landlord_permission: boolean;
  household_members: number;
  other_pets: string;
  selected_cat_id: string | null;
  selected_cat_name: string;
  previous_experience: string;
  daily_routine: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export const MENU_CATEGORIES: { value: MenuCategory; label: string; emoji: string }[] = [
  { value: 'coffee', label: 'Pawsome Coffee', emoji: '☕' },
  { value: 'pastry', label: 'Purrfect Pastries', emoji: '🥐' },
  { value: 'tea', label: 'Meow-gical Teas', emoji: '🍵' },
  { value: 'vegan', label: 'Vegan Options', emoji: '🌱' },
];

export const DIETARY_TAGS: DietaryTag[] = ['Gluten-Free', 'Vegan', 'Nut-Free', 'Dairy-Free', 'Vegetarian'];

export const CAT_STATUSES: { value: CatStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available for Adoption', color: 'mint' },
  { value: 'resident', label: 'Resident Cat', color: 'lavender' },
  { value: 'pending', label: 'Pending Adoption', color: 'warm' },
  { value: 'adopted', label: 'Adopted', color: 'rose' },
];

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'under_review', label: 'Under Review', color: 'warm' },
  { value: 'approved', label: 'Approved', color: 'mint' },
  { value: 'archived', label: 'Archived', color: 'rose' },
];
