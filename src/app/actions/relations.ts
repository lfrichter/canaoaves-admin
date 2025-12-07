"use server";

import { verifyUserRole } from "@/utils/auth/server";
import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverClient";
import { revalidatePath } from "next/cache";

// Sincroniza Comodidades <-> Categorias
export async function updateAmenityCategories(amenityId: string, categoryIds: string[]) {
  await verifyUserRole(["admin", "master"]);
  const supabase = createSupabaseServiceRoleClient();

  const { error } = await supabase.rpc("sync_amenity_categories", {
    p_amenity_id: amenityId,
    p_category_ids: categoryIds,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/amenities");
}

// Sincroniza Ofertas <-> Categorias
export async function updateOfferingCategories(offeringId: string, categoryIds: string[]) {
  await verifyUserRole(["admin", "master"]);
  const supabase = createSupabaseServiceRoleClient();

  const { error } = await supabase.rpc("sync_offering_categories", {
    p_offering_id: offeringId,
    p_category_ids: categoryIds,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/service_offerings");
}

// Busca as categorias atuais de um item (para preencher os checkboxes)
export async function getRelatedCategories(
  itemId: string,
  type: "amenity" | "offering"
): Promise<string[]> {
  const supabase = createSupabaseServiceRoleClient();

  if (type === "amenity") {
    const { data } = await supabase
      .from("category_amenities")
      .select("category_id")
      .eq("amenity_id", itemId);
    return data?.map((d) => d.category_id) || [];
  } else {
    const { data } = await supabase
      .from("category_service_offerings")
      .select("category_id")
      .eq("service_offering_id", itemId);
    return data?.map((d) => d.category_id) || [];
  }
}
