/**
 * Access rules (ROLE-002). The server decides what each account type may do and
 * sends the logged-in user's rules as `user.permissions`; the website only uses them
 * to show or hide pages and actions. The server still checks every action.
 */

export type Permission =
  // Admin
  | "manage_users"
  | "manage_countries"
  | "manage_services"
  | "manage_pricing"
  | "view_all_shipments"
  | "view_invoices"
  | "view_reports"
  | "manage_system"
  // Customer
  | "manage_own_profile"
  | "create_shipments"
  | "view_own_shipments"
  | "track_own_shipments"
  | "view_own_invoices"
  | "view_permitted_documents"
  // Logistics Staff
  | "view_operational_shipments"
  | "confirm_shipments"
  | "assign_delivery_agents"
  | "manage_shipment_operations"
  | "view_operational_info"
  // Delivery Agent
  | "view_assigned_shipments"
  | "manage_assigned_pickups"
  | "manage_assigned_deliveries"
  | "upload_proof_of_delivery";

/** How each rule reads to the user, in the order the dashboard lists them. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_users: "Manage users",
  manage_countries: "Manage countries",
  manage_services: "Manage services",
  manage_pricing: "Manage pricing",
  view_all_shipments: "View all shipments",
  view_invoices: "View invoices",
  view_reports: "View reports",
  manage_system: "Manage system information",
  manage_own_profile: "Manage your profile",
  create_shipments: "Create shipments",
  view_own_shipments: "View your shipments",
  track_own_shipments: "Track your shipments",
  view_own_invoices: "View your invoices",
  view_permitted_documents: "View your documents",
  view_operational_shipments: "View operational shipments",
  confirm_shipments: "Confirm shipments",
  assign_delivery_agents: "Assign delivery agents",
  manage_shipment_operations: "Manage shipment operations",
  view_operational_info: "View operational information",
  view_assigned_shipments: "View your assigned shipments",
  manage_assigned_pickups: "Manage your pickup tasks",
  manage_assigned_deliveries: "Manage your delivery tasks",
  upload_proof_of_delivery: "Upload proof of delivery",
};

export function can(user: { permissions: Permission[] } | null, permission: Permission): boolean {
  return !!user && user.permissions.includes(permission);
}

/** The user's rules in display order, as labels. */
export function permissionLabels(user: { permissions: Permission[] }): string[] {
  return (Object.keys(PERMISSION_LABELS) as Permission[])
    .filter((permission) => user.permissions.includes(permission))
    .map((permission) => PERMISSION_LABELS[permission]);
}
