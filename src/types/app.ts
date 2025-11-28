import { Database } from "./database.types";

// Type Shortcuts for daily use

// Tables
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Photo = Database["public"]["Tables"]["photos"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type City = Database["public"]["Tables"]["cities"]["Row"];
export type Amenity = Database["public"]["Tables"]["amenities"]["Row"];
export type ServiceOffering =
  Database["public"]["Tables"]["service_offerings"]["Row"];
export type TableName = keyof Database["public"]["Tables"];

// Enums
export type ProfileType = Database["public"]["Enums"]["profile_type"];
export type ReportStatus = Database["public"]["Enums"]["report_status"];
export type ReportReason = Database["public"]["Enums"]["report_reason"];
export type ReportTargetType = Database["public"]["Enums"]["report_target_type"];
export type CommentTargetType = Database["public"]["Enums"]["comment_target_type"];
export type PhotoTargetType = Database["public"]["Enums"]["photo_target_type"];
export type ClaimStatus = Database["public"]["Enums"]["claim_status"];

// Function Return Types
export type ProfileWithUser =
  Database["public"]["Functions"]["get_profiles_with_users"]["Returns"][number];

