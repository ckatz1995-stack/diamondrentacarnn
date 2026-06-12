/* eslint-disable */
// AUTO-GENERATED from /cms/*.json — do not edit by hand.
// Regenerate after changing any cms/*.json schema file:
//   node tools/gen-collection-schemas.mjs
// Field types use the Wix Data v2 Collections enum (TEXT, NUMBER, BOOLEAN,
// DATE, DATETIME, URL, IMAGE). Permissions use ANYONE | ADMIN.

export const COLLECTION_SCHEMAS = [
  {
    "_id": "BookingReviews",
    "displayName": "Booking Reviews",
    "fields": [
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "bookingId",
        "displayName": "Booking ID",
        "type": "TEXT"
      },
      {
        "key": "bookingNumber",
        "displayName": "Booking Number",
        "type": "TEXT"
      },
      {
        "key": "customerId",
        "displayName": "Customer ID",
        "type": "TEXT"
      },
      {
        "key": "customerName",
        "displayName": "Customer Name",
        "type": "TEXT"
      },
      {
        "key": "memberId",
        "displayName": "Wix Member ID",
        "type": "TEXT"
      },
      {
        "key": "rating",
        "displayName": "Overall Rating",
        "type": "NUMBER"
      },
      {
        "key": "vehicleRating",
        "displayName": "Vehicle Rating",
        "type": "NUMBER"
      },
      {
        "key": "serviceRating",
        "displayName": "Service Rating",
        "type": "NUMBER"
      },
      {
        "key": "valueRating",
        "displayName": "Value Rating",
        "type": "NUMBER"
      },
      {
        "key": "title",
        "displayName": "Review Title",
        "type": "TEXT"
      },
      {
        "key": "body",
        "displayName": "Review Body",
        "type": "TEXT"
      },
      {
        "key": "status",
        "displayName": "Status",
        "type": "TEXT"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      },
      {
        "key": "staffReply",
        "displayName": "Staff Reply",
        "type": "TEXT"
      },
      {
        "key": "staffReplyAt",
        "displayName": "Staff Reply At",
        "type": "DATETIME"
      },
      {
        "key": "submittedAt",
        "displayName": "Submitted At",
        "type": "DATETIME"
      },
      {
        "key": "moderatedAt",
        "displayName": "Moderated At",
        "type": "DATETIME"
      },
      {
        "key": "moderatedBy",
        "displayName": "Moderated By",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "BookingsNew",
    "displayName": "Bookings",
    "fields": [
      {
        "key": "bookingNumber",
        "displayName": "Booking Number",
        "type": "TEXT"
      },
      {
        "key": "status",
        "displayName": "Status",
        "type": "TEXT"
      },
      {
        "key": "rentalState",
        "displayName": "Rental State",
        "type": "TEXT"
      },
      {
        "key": "statusChangedAt",
        "displayName": "Status Changed At",
        "type": "DATETIME"
      },
      {
        "key": "confirmedAt",
        "displayName": "Confirmed At",
        "type": "DATETIME"
      },
      {
        "key": "canceledAt",
        "displayName": "Canceled At",
        "type": "DATETIME"
      },
      {
        "key": "customerName",
        "displayName": "Customer Name",
        "type": "TEXT"
      },
      {
        "key": "phone",
        "displayName": "Phone",
        "type": "TEXT"
      },
      {
        "key": "email",
        "displayName": "Email",
        "type": "TEXT"
      },
      {
        "key": "memberId",
        "displayName": "Member ID",
        "type": "TEXT"
      },
      {
        "key": "customerCity",
        "displayName": "Customer City",
        "type": "TEXT"
      },
      {
        "key": "originCity",
        "displayName": "Origin City",
        "type": "TEXT"
      },
      {
        "key": "flightNumber",
        "displayName": "Flight Number",
        "type": "TEXT"
      },
      {
        "key": "driverAgeBand",
        "displayName": "Driver Age Band",
        "type": "TEXT"
      },
      {
        "key": "pickupDateTime",
        "displayName": "Pickup Date & Time",
        "type": "DATETIME"
      },
      {
        "key": "dropoffDateTime",
        "displayName": "Dropoff Date & Time",
        "type": "DATETIME"
      },
      {
        "key": "pickuppoint",
        "displayName": "Pickup Location",
        "type": "TEXT"
      },
      {
        "key": "dropoffpoint",
        "displayName": "Dropoff Location",
        "type": "TEXT"
      },
      {
        "key": "pickupStation",
        "displayName": "Pickup Station",
        "type": "TEXT"
      },
      {
        "key": "dropoffStation",
        "displayName": "Dropoff Station",
        "type": "TEXT"
      },
      {
        "key": "pickupComment",
        "displayName": "Pickup Comment",
        "type": "TEXT"
      },
      {
        "key": "dropoffComment",
        "displayName": "Dropoff Comment",
        "type": "TEXT"
      },
      {
        "key": "billableDays",
        "displayName": "Billable Days",
        "type": "NUMBER"
      },
      {
        "key": "category",
        "displayName": "Category Code",
        "type": "TEXT"
      },
      {
        "key": "categoryId",
        "displayName": "Category ID",
        "type": "TEXT"
      },
      {
        "key": "bookedCategoryCode",
        "displayName": "Booked Category Code",
        "type": "TEXT"
      },
      {
        "key": "assignedVehicle",
        "displayName": "Assigned Vehicle ID",
        "type": "TEXT"
      },
      {
        "key": "assignedVehiclePlate",
        "displayName": "Assigned Vehicle Plate",
        "type": "TEXT"
      },
      {
        "key": "assignedVehicleModel",
        "displayName": "Assigned Vehicle Model",
        "type": "TEXT"
      },
      {
        "key": "assignedVehicleLabel",
        "displayName": "Assigned Vehicle Label",
        "type": "TEXT"
      },
      {
        "key": "assignedCategoryCode",
        "displayName": "Assigned Category Code",
        "type": "TEXT"
      },
      {
        "key": "transmission",
        "displayName": "Transmission Preference",
        "type": "TEXT"
      },
      {
        "key": "fuelType",
        "displayName": "Fuel Type Preference",
        "type": "TEXT"
      },
      {
        "key": "selectedPackage",
        "displayName": "Insurance Package",
        "type": "TEXT"
      },
      {
        "key": "selectedExtras",
        "displayName": "Selected Extras",
        "type": "TEXT"
      },
      {
        "key": "selectedExtrasList",
        "displayName": "Selected Extras Detail",
        "type": "TEXT"
      },
      {
        "key": "extras",
        "displayName": "Extras Summary",
        "type": "TEXT"
      },
      {
        "key": "basePricePerDay",
        "displayName": "Base Price / Day",
        "type": "NUMBER"
      },
      {
        "key": "insuranceExtraPerDay",
        "displayName": "Insurance Extra / Day",
        "type": "NUMBER"
      },
      {
        "key": "extrasTotal",
        "displayName": "Extras Total",
        "type": "NUMBER"
      },
      {
        "key": "ageFee",
        "displayName": "Age Fee",
        "type": "NUMBER"
      },
      {
        "key": "nightFee",
        "displayName": "Night Fee",
        "type": "NUMBER"
      },
      {
        "key": "locationFee",
        "displayName": "Location Fee",
        "type": "NUMBER"
      },
      {
        "key": "pickupLocationFee",
        "displayName": "Pickup Location Fee",
        "type": "NUMBER"
      },
      {
        "key": "dropoffLocationFee",
        "displayName": "Dropoff Location Fee",
        "type": "NUMBER"
      },
      {
        "key": "totalPrice",
        "displayName": "Total Price",
        "type": "NUMBER"
      },
      {
        "key": "totalBalance",
        "displayName": "Total Balance",
        "type": "NUMBER"
      },
      {
        "key": "paymentStatus",
        "displayName": "Payment Status",
        "type": "TEXT"
      },
      {
        "key": "pricingSnapshot",
        "displayName": "Pricing Snapshot",
        "type": "TEXT"
      },
      {
        "key": "financialSnapshot",
        "displayName": "Financial Snapshot",
        "type": "TEXT"
      },
      {
        "key": "source",
        "displayName": "Source",
        "type": "TEXT"
      },
      {
        "key": "agent",
        "displayName": "Agent",
        "type": "TEXT"
      },
      {
        "key": "cdp",
        "displayName": "CDP (Corporate)",
        "type": "TEXT"
      },
      {
        "key": "channel",
        "displayName": "Channel",
        "type": "TEXT"
      },
      {
        "key": "companyName",
        "displayName": "Company Name",
        "type": "TEXT"
      },
      {
        "key": "voucherNumber",
        "displayName": "Voucher Number",
        "type": "TEXT"
      },
      {
        "key": "confirmationNumber",
        "displayName": "Confirmation Number",
        "type": "TEXT"
      },
      {
        "key": "triageOwner",
        "displayName": "Triage Owner",
        "type": "TEXT"
      },
      {
        "key": "triageUpdatedAt",
        "displayName": "Triage Updated At",
        "type": "DATETIME"
      },
      {
        "key": "triageLastAction",
        "displayName": "Triage Last Action",
        "type": "TEXT"
      },
      {
        "key": "triageLastNote",
        "displayName": "Triage Last Note",
        "type": "TEXT"
      },
      {
        "key": "triageNextFollowUpAt",
        "displayName": "Triage Next Follow-Up",
        "type": "DATETIME"
      },
      {
        "key": "triageHistorySummary",
        "displayName": "Triage History",
        "type": "TEXT"
      },
      {
        "key": "triageAudit",
        "displayName": "Triage Audit",
        "type": "TEXT"
      },
      {
        "key": "triageScore",
        "displayName": "Triage Score",
        "type": "NUMBER"
      },
      {
        "key": "vehicleServiceBlocked",
        "displayName": "Vehicle Service Blocked",
        "type": "BOOLEAN"
      },
      {
        "key": "internalMemo",
        "displayName": "Internal Memo",
        "type": "TEXT"
      },
      {
        "key": "remarks",
        "displayName": "Remarks",
        "type": "TEXT"
      },
      {
        "key": "customerComments",
        "displayName": "Customer Comments",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "BusinessSettings",
    "displayName": "Business Settings",
    "fields": [
      {
        "key": "title",
        "displayName": "Title",
        "type": "TEXT"
      },
      {
        "key": "companyName",
        "displayName": "Company Name",
        "type": "TEXT"
      },
      {
        "key": "companyTagline",
        "displayName": "Company Tagline",
        "type": "TEXT"
      },
      {
        "key": "companyCity",
        "displayName": "Company City",
        "type": "TEXT"
      },
      {
        "key": "companyAddress",
        "displayName": "Company Address",
        "type": "TEXT"
      },
      {
        "key": "companyPhone",
        "displayName": "Company Phone",
        "type": "TEXT"
      },
      {
        "key": "companyEmail",
        "displayName": "Company Email",
        "type": "TEXT"
      },
      {
        "key": "footerNote",
        "displayName": "Footer Note",
        "type": "TEXT"
      },
      {
        "key": "facebookUrl",
        "displayName": "Facebook URL",
        "type": "URL"
      },
      {
        "key": "instagramUrl",
        "displayName": "Instagram URL",
        "type": "URL"
      },
      {
        "key": "whatsappNumber",
        "displayName": "WhatsApp Number",
        "type": "TEXT"
      },
      {
        "key": "googleMapsUrl",
        "displayName": "Google Maps URL",
        "type": "URL"
      },
      {
        "key": "currency",
        "displayName": "Currency",
        "type": "TEXT"
      },
      {
        "key": "vatRate",
        "displayName": "VAT Rate (%)",
        "type": "NUMBER"
      },
      {
        "key": "vatRateDecimal",
        "displayName": "VAT Rate (decimal)",
        "type": "NUMBER"
      },
      {
        "key": "defaultDeposit",
        "displayName": "Default Deposit",
        "type": "NUMBER"
      },
      {
        "key": "nightStartHour",
        "displayName": "Night Start Hour",
        "type": "NUMBER"
      },
      {
        "key": "nightEndHour",
        "displayName": "Night End Hour",
        "type": "NUMBER"
      },
      {
        "key": "billingGraceMinutes",
        "displayName": "Billing Grace Minutes",
        "type": "NUMBER"
      },
      {
        "key": "minRentalDays",
        "displayName": "Min Rental Days",
        "type": "NUMBER"
      },
      {
        "key": "maxRentalDays",
        "displayName": "Max Rental Days",
        "type": "NUMBER"
      },
      {
        "key": "minDriverAge",
        "displayName": "Min Driver Age",
        "type": "NUMBER"
      },
      {
        "key": "operatingHoursLabel",
        "displayName": "Operating Hours Label",
        "type": "TEXT"
      },
      {
        "key": "afterHoursNotice",
        "displayName": "After-Hours Notice",
        "type": "TEXT"
      },
      {
        "key": "allowOverbooking",
        "displayName": "Allow Overbooking",
        "type": "BOOLEAN"
      },
      {
        "key": "vehiclesPageDisplayMode",
        "displayName": "Vehicles Page Display Mode",
        "type": "TEXT"
      },
      {
        "key": "vehiclesPageModelsSource",
        "displayName": "Vehicles Page Models Source",
        "type": "TEXT"
      },
      {
        "key": "enableTriggeredEmails",
        "displayName": "Enable Triggered Emails",
        "type": "BOOLEAN"
      },
      {
        "key": "bookingConfirmedTriggerId",
        "displayName": "Booking Confirmed Trigger ID",
        "type": "TEXT"
      },
      {
        "key": "bookingCanceledTriggerId",
        "displayName": "Booking Canceled Trigger ID",
        "type": "TEXT"
      },
      {
        "key": "emailFromName",
        "displayName": "Email From Name",
        "type": "TEXT"
      },
      {
        "key": "emailReplyTo",
        "displayName": "Email Reply-To",
        "type": "TEXT"
      },
      {
        "key": "rentalTermsTitle",
        "displayName": "Rental Terms Title",
        "type": "TEXT"
      },
      {
        "key": "rentalTermsIntro",
        "displayName": "Rental Terms Intro",
        "type": "TEXT"
      },
      {
        "key": "rentalTermsBody",
        "displayName": "Rental Terms Body",
        "type": "TEXT"
      },
      {
        "key": "rentalRequirementsBody",
        "displayName": "Rental Requirements Body",
        "type": "TEXT"
      },
      {
        "key": "rentalPoliciesBody",
        "displayName": "Rental Policies Body",
        "type": "TEXT"
      },
      {
        "key": "rentalPrivacyBody",
        "displayName": "Rental Privacy Body",
        "type": "TEXT"
      },
      {
        "key": "insuranceTermsTitle",
        "displayName": "Insurance Terms Title",
        "type": "TEXT"
      },
      {
        "key": "insuranceTermsIntro",
        "displayName": "Insurance Terms Intro",
        "type": "TEXT"
      },
      {
        "key": "insuranceTermsBody",
        "displayName": "Insurance Terms Body",
        "type": "TEXT"
      },
      {
        "key": "insuranceDetailsTitle",
        "displayName": "Insurance Details Title",
        "type": "TEXT"
      },
      {
        "key": "insuranceDetailsIntro",
        "displayName": "Insurance Details Intro",
        "type": "TEXT"
      },
      {
        "key": "insuranceDetailsBody",
        "displayName": "Insurance Details Body",
        "type": "TEXT"
      },
      {
        "key": "stationProfiles",
        "displayName": "Station Profiles",
        "type": "TEXT"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "CategoryRateRules",
    "displayName": "Category Rate Rules",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Label",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "categoryCode",
        "displayName": "Category Code",
        "type": "TEXT"
      },
      {
        "key": "vehicleCategoryId",
        "displayName": "Vehicle Category ID",
        "type": "TEXT"
      },
      {
        "key": "seasonKey",
        "displayName": "Season Key",
        "type": "TEXT"
      },
      {
        "key": "minDays",
        "displayName": "Min Days",
        "type": "NUMBER"
      },
      {
        "key": "maxDays",
        "displayName": "Max Days",
        "type": "NUMBER"
      },
      {
        "key": "pricePerDay",
        "displayName": "Price Per Day",
        "type": "NUMBER"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "Companies",
    "displayName": "Companies",
    "fields": [
      {
        "key": "companyName",
        "displayName": "Company Name",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "cdpCode",
        "displayName": "CDP Code",
        "type": "TEXT"
      },
      {
        "key": "contactName",
        "displayName": "Contact Name",
        "type": "TEXT"
      },
      {
        "key": "contactEmail",
        "displayName": "Contact Email",
        "type": "TEXT"
      },
      {
        "key": "contactPhone",
        "displayName": "Contact Phone",
        "type": "TEXT"
      },
      {
        "key": "address",
        "displayName": "Address",
        "type": "TEXT"
      },
      {
        "key": "city",
        "displayName": "City",
        "type": "TEXT"
      },
      {
        "key": "country",
        "displayName": "Country",
        "type": "TEXT"
      },
      {
        "key": "vatNumber",
        "displayName": "VAT Number",
        "type": "TEXT"
      },
      {
        "key": "discountType",
        "displayName": "Discount Type",
        "type": "TEXT"
      },
      {
        "key": "discountValue",
        "displayName": "Discount Value",
        "type": "NUMBER"
      },
      {
        "key": "creditLimit",
        "displayName": "Credit Limit",
        "type": "NUMBER"
      },
      {
        "key": "currentBalance",
        "displayName": "Current Balance",
        "type": "NUMBER"
      },
      {
        "key": "paymentTerms",
        "displayName": "Payment Terms",
        "type": "TEXT"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "notes",
        "displayName": "Notes",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "Customers",
    "displayName": "Customers",
    "fields": [
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "fullName",
        "displayName": "Full Name",
        "type": "TEXT"
      },
      {
        "key": "email",
        "displayName": "Email",
        "type": "TEXT"
      },
      {
        "key": "phone",
        "displayName": "Phone",
        "type": "TEXT"
      },
      {
        "key": "memberId",
        "displayName": "Wix Member ID",
        "type": "TEXT"
      },
      {
        "key": "companyId",
        "displayName": "Company ID",
        "type": "TEXT"
      },
      {
        "key": "companyName",
        "displayName": "Company Name",
        "type": "TEXT"
      },
      {
        "key": "driverAgeBand",
        "displayName": "Driver Age Band",
        "type": "TEXT"
      },
      {
        "key": "idType",
        "displayName": "ID Type",
        "type": "TEXT"
      },
      {
        "key": "idNumber",
        "displayName": "ID Number",
        "type": "TEXT"
      },
      {
        "key": "idExpiryDate",
        "displayName": "ID Expiry Date",
        "type": "DATETIME"
      },
      {
        "key": "driverLicenseNumber",
        "displayName": "Driver License Number",
        "type": "TEXT"
      },
      {
        "key": "driverLicenseExpiry",
        "displayName": "Driver License Expiry",
        "type": "DATETIME"
      },
      {
        "key": "address",
        "displayName": "Address",
        "type": "TEXT"
      },
      {
        "key": "city",
        "displayName": "City",
        "type": "TEXT"
      },
      {
        "key": "country",
        "displayName": "Country",
        "type": "TEXT"
      },
      {
        "key": "totalBookings",
        "displayName": "Total Bookings",
        "type": "NUMBER"
      },
      {
        "key": "totalSpend",
        "displayName": "Total Spend",
        "type": "NUMBER"
      },
      {
        "key": "firstBookingAt",
        "displayName": "First Booking At",
        "type": "DATETIME"
      },
      {
        "key": "lastBookingAt",
        "displayName": "Last Booking At",
        "type": "DATETIME"
      },
      {
        "key": "tags",
        "displayName": "Tags",
        "type": "TEXT"
      },
      {
        "key": "blacklisted",
        "displayName": "Blacklisted",
        "type": "BOOLEAN"
      },
      {
        "key": "blacklistReason",
        "displayName": "Blacklist Reason",
        "type": "TEXT"
      },
      {
        "key": "notes",
        "displayName": "Internal Notes",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "ExtraServices",
    "displayName": "Extra Services",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "title",
        "displayName": "Title",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Short Label",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "price",
        "displayName": "Price",
        "type": "NUMBER"
      },
      {
        "key": "billingMode",
        "displayName": "Billing Mode",
        "type": "TEXT"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "FeeRules",
    "displayName": "Fee Rules",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "title",
        "displayName": "Title",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Short Label",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "ruleType",
        "displayName": "Rule Type",
        "type": "TEXT"
      },
      {
        "key": "audienceGroup",
        "displayName": "Audience Group",
        "type": "TEXT"
      },
      {
        "key": "amount",
        "displayName": "Amount",
        "type": "NUMBER"
      },
      {
        "key": "billingMode",
        "displayName": "Billing Mode",
        "type": "TEXT"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "FleetNew",
    "displayName": "Fleet Vehicles",
    "fields": [
      {
        "key": "plate",
        "displayName": "Plate",
        "type": "TEXT"
      },
      {
        "key": "model",
        "displayName": "Model",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "category",
        "displayName": "Category Code",
        "type": "TEXT"
      },
      {
        "key": "categoryId",
        "displayName": "Category ID",
        "type": "TEXT"
      },
      {
        "key": "categoryDisplayTitle",
        "displayName": "Category Display Title",
        "type": "TEXT"
      },
      {
        "key": "categoryTitle",
        "displayName": "Category Title",
        "type": "TEXT"
      },
      {
        "key": "status",
        "displayName": "Status",
        "type": "TEXT"
      },
      {
        "key": "operationalStatus",
        "displayName": "Operational Status",
        "type": "TEXT"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "readyToGo",
        "displayName": "Ready To Go",
        "type": "BOOLEAN"
      },
      {
        "key": "hardHold",
        "displayName": "Hard Hold",
        "type": "BOOLEAN"
      },
      {
        "key": "station",
        "displayName": "Station",
        "type": "TEXT"
      },
      {
        "key": "currentStationCode",
        "displayName": "Current Station Code",
        "type": "TEXT"
      },
      {
        "key": "currentStationLabel",
        "displayName": "Current Station Label",
        "type": "TEXT"
      },
      {
        "key": "stall",
        "displayName": "Stall",
        "type": "TEXT"
      },
      {
        "key": "mileage",
        "displayName": "Mileage",
        "type": "NUMBER"
      },
      {
        "key": "notes",
        "displayName": "Notes",
        "type": "TEXT"
      },
      {
        "key": "photoFront",
        "displayName": "Photo Front",
        "type": "TEXT"
      },
      {
        "key": "photoSide",
        "displayName": "Photo Side",
        "type": "TEXT"
      },
      {
        "key": "photoBack",
        "displayName": "Photo Back",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "InsurancePlans",
    "displayName": "Insurance Plans",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "title",
        "displayName": "Title",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Short Label",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "pricePerDay",
        "displayName": "Price Per Day",
        "type": "NUMBER"
      },
      {
        "key": "billingMode",
        "displayName": "Billing Mode",
        "type": "TEXT"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "MaintenanceJobs",
    "displayName": "Maintenance Jobs",
    "fields": [
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "vehicleId",
        "displayName": "Vehicle ID",
        "type": "TEXT"
      },
      {
        "key": "vehiclePlate",
        "displayName": "Vehicle Plate",
        "type": "TEXT"
      },
      {
        "key": "vehicleModel",
        "displayName": "Vehicle Model",
        "type": "TEXT"
      },
      {
        "key": "jobType",
        "displayName": "Job Type",
        "type": "TEXT"
      },
      {
        "key": "title",
        "displayName": "Job Title",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "status",
        "displayName": "Status",
        "type": "TEXT"
      },
      {
        "key": "priority",
        "displayName": "Priority",
        "type": "TEXT"
      },
      {
        "key": "scheduledAt",
        "displayName": "Scheduled At",
        "type": "DATETIME"
      },
      {
        "key": "startedAt",
        "displayName": "Started At",
        "type": "DATETIME"
      },
      {
        "key": "completedAt",
        "displayName": "Completed At",
        "type": "DATETIME"
      },
      {
        "key": "mileageAtService",
        "displayName": "Mileage at Service",
        "type": "NUMBER"
      },
      {
        "key": "nextServiceMileage",
        "displayName": "Next Service Mileage",
        "type": "NUMBER"
      },
      {
        "key": "nextServiceDate",
        "displayName": "Next Service Date",
        "type": "DATETIME"
      },
      {
        "key": "cost",
        "displayName": "Cost",
        "type": "NUMBER"
      },
      {
        "key": "vendor",
        "displayName": "Vendor / Garage",
        "type": "TEXT"
      },
      {
        "key": "invoiceNumber",
        "displayName": "Invoice Number",
        "type": "TEXT"
      },
      {
        "key": "assignedStaffId",
        "displayName": "Assigned Staff ID",
        "type": "TEXT"
      },
      {
        "key": "assignedStaffName",
        "displayName": "Assigned Staff Name",
        "type": "TEXT"
      },
      {
        "key": "blocksVehicle",
        "displayName": "Blocks Vehicle",
        "type": "BOOLEAN"
      },
      {
        "key": "notes",
        "displayName": "Notes",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "MemberNotifications",
    "displayName": "Member Notifications",
    "fields": [
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "memberId",
        "displayName": "Wix Member ID",
        "type": "TEXT"
      },
      {
        "key": "customerId",
        "displayName": "Customer ID",
        "type": "TEXT"
      },
      {
        "key": "type",
        "displayName": "Notification Type",
        "type": "TEXT"
      },
      {
        "key": "title",
        "displayName": "Title",
        "type": "TEXT"
      },
      {
        "key": "body",
        "displayName": "Body",
        "type": "TEXT"
      },
      {
        "key": "bookingId",
        "displayName": "Booking ID",
        "type": "TEXT"
      },
      {
        "key": "bookingNumber",
        "displayName": "Booking Number",
        "type": "TEXT"
      },
      {
        "key": "linkUrl",
        "displayName": "Link URL",
        "type": "URL"
      },
      {
        "key": "linkLabel",
        "displayName": "Link Label",
        "type": "TEXT"
      },
      {
        "key": "read",
        "displayName": "Read",
        "type": "BOOLEAN"
      },
      {
        "key": "readAt",
        "displayName": "Read At",
        "type": "DATETIME"
      },
      {
        "key": "sentAt",
        "displayName": "Sent At",
        "type": "DATETIME"
      },
      {
        "key": "expiresAt",
        "displayName": "Expires At",
        "type": "DATETIME"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "PickupLocations",
    "displayName": "Pickup Locations",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Label",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "address",
        "displayName": "Address",
        "type": "TEXT"
      },
      {
        "key": "mapUrl",
        "displayName": "Google Maps URL",
        "type": "URL"
      },
      {
        "key": "stationKey",
        "displayName": "Station Key",
        "type": "TEXT"
      },
      {
        "key": "stationLabel",
        "displayName": "Station Label",
        "type": "TEXT"
      },
      {
        "key": "locationType",
        "displayName": "Location Type",
        "type": "TEXT"
      },
      {
        "key": "extraFee",
        "displayName": "Extra Fee",
        "type": "NUMBER"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      },
      {
        "key": "pickupInfoLabel",
        "displayName": "Pickup Info Label",
        "type": "TEXT"
      },
      {
        "key": "pickupInfoPlaceholder",
        "displayName": "Pickup Info Placeholder",
        "type": "TEXT"
      },
      {
        "key": "dropoffInfoLabel",
        "displayName": "Dropoff Info Label",
        "type": "TEXT"
      },
      {
        "key": "dropoffInfoPlaceholder",
        "displayName": "Dropoff Info Placeholder",
        "type": "TEXT"
      },
      {
        "key": "showOriginField",
        "displayName": "Show Origin Field",
        "type": "BOOLEAN"
      },
      {
        "key": "originFieldLabel",
        "displayName": "Origin Field Label",
        "type": "TEXT"
      },
      {
        "key": "originFieldPlaceholder",
        "displayName": "Origin Field Placeholder",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ANYONE",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "PortalSessions",
    "displayName": "Portal Sessions",
    "fields": [
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "memberId",
        "displayName": "Wix Member ID",
        "type": "TEXT"
      },
      {
        "key": "customerId",
        "displayName": "Customer ID",
        "type": "TEXT"
      },
      {
        "key": "token",
        "displayName": "Session Token",
        "type": "TEXT"
      },
      {
        "key": "createdAt",
        "displayName": "Created At",
        "type": "DATETIME"
      },
      {
        "key": "expiresAt",
        "displayName": "Expires At",
        "type": "DATETIME"
      },
      {
        "key": "lastActiveAt",
        "displayName": "Last Active At",
        "type": "DATETIME"
      },
      {
        "key": "ipAddress",
        "displayName": "IP Address",
        "type": "TEXT"
      },
      {
        "key": "userAgent",
        "displayName": "User Agent",
        "type": "TEXT"
      },
      {
        "key": "revoked",
        "displayName": "Revoked",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "PricingSeasons",
    "displayName": "Pricing Seasons",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Label",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "startDate",
        "displayName": "Start Date",
        "type": "DATE"
      },
      {
        "key": "endDate",
        "displayName": "End Date",
        "type": "DATE"
      },
      {
        "key": "priority",
        "displayName": "Priority",
        "type": "NUMBER"
      },
      {
        "key": "repeatYearly",
        "displayName": "Repeat Yearly",
        "type": "BOOLEAN"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "RentalsNew",
    "displayName": "Active Rentals",
    "fields": [
      {
        "key": "bookingId",
        "displayName": "Booking ID",
        "type": "TEXT"
      },
      {
        "key": "bookingNumber",
        "displayName": "Booking Number",
        "type": "TEXT"
      },
      {
        "key": "vehicleId",
        "displayName": "Vehicle ID",
        "type": "TEXT"
      },
      {
        "key": "vehiclePlate",
        "displayName": "Vehicle Plate",
        "type": "TEXT"
      },
      {
        "key": "vehicleModel",
        "displayName": "Vehicle Model",
        "type": "TEXT"
      },
      {
        "key": "customerName",
        "displayName": "Customer Name",
        "type": "TEXT"
      },
      {
        "key": "phone",
        "displayName": "Phone",
        "type": "TEXT"
      },
      {
        "key": "email",
        "displayName": "Email",
        "type": "TEXT"
      },
      {
        "key": "pickupDateTime",
        "displayName": "Pickup Date & Time",
        "type": "DATETIME"
      },
      {
        "key": "dropoffDateTime",
        "displayName": "Dropoff Date & Time",
        "type": "DATETIME"
      },
      {
        "key": "actualPickupAt",
        "displayName": "Actual Pickup Time",
        "type": "DATETIME"
      },
      {
        "key": "actualDropoffAt",
        "displayName": "Actual Dropoff Time",
        "type": "DATETIME"
      },
      {
        "key": "checkInStaffId",
        "displayName": "Check-In Staff ID",
        "type": "TEXT"
      },
      {
        "key": "checkInStaffName",
        "displayName": "Check-In Staff Name",
        "type": "TEXT"
      },
      {
        "key": "checkOutStaffId",
        "displayName": "Check-Out Staff ID",
        "type": "TEXT"
      },
      {
        "key": "checkOutStaffName",
        "displayName": "Check-Out Staff Name",
        "type": "TEXT"
      },
      {
        "key": "fuelLevelOut",
        "displayName": "Fuel Level Out",
        "type": "TEXT"
      },
      {
        "key": "fuelLevelIn",
        "displayName": "Fuel Level In",
        "type": "TEXT"
      },
      {
        "key": "mileageOut",
        "displayName": "Mileage Out",
        "type": "NUMBER"
      },
      {
        "key": "mileageIn",
        "displayName": "Mileage In",
        "type": "NUMBER"
      },
      {
        "key": "mileageDriven",
        "displayName": "Mileage Driven",
        "type": "NUMBER"
      },
      {
        "key": "conditionOut",
        "displayName": "Condition Notes Out",
        "type": "TEXT"
      },
      {
        "key": "conditionIn",
        "displayName": "Condition Notes In",
        "type": "TEXT"
      },
      {
        "key": "damagesOut",
        "displayName": "Damages Out (JSON)",
        "type": "TEXT"
      },
      {
        "key": "damagesIn",
        "displayName": "Damages In (JSON)",
        "type": "TEXT"
      },
      {
        "key": "depositAmount",
        "displayName": "Deposit Amount",
        "type": "NUMBER"
      },
      {
        "key": "depositMethod",
        "displayName": "Deposit Method",
        "type": "TEXT"
      },
      {
        "key": "depositReturned",
        "displayName": "Deposit Returned",
        "type": "BOOLEAN"
      },
      {
        "key": "depositReturnedAt",
        "displayName": "Deposit Returned At",
        "type": "DATETIME"
      },
      {
        "key": "rentalStatus",
        "displayName": "Rental Status",
        "type": "TEXT"
      },
      {
        "key": "closedAt",
        "displayName": "Closed At",
        "type": "DATETIME"
      },
      {
        "key": "extendedDropoffAt",
        "displayName": "Extended Dropoff Date",
        "type": "DATETIME"
      },
      {
        "key": "internalNotes",
        "displayName": "Internal Notes",
        "type": "TEXT"
      },
      {
        "key": "checkInSignatureUrl",
        "displayName": "Check-In Signature URL",
        "type": "URL"
      },
      {
        "key": "checkOutSignatureUrl",
        "displayName": "Check-Out Signature URL",
        "type": "URL"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "StaffAuditLog",
    "displayName": "Staff Audit Log",
    "fields": [
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "staffId",
        "displayName": "Staff User ID",
        "type": "TEXT"
      },
      {
        "key": "staffUsername",
        "displayName": "Staff Username",
        "type": "TEXT"
      },
      {
        "key": "action",
        "displayName": "Action",
        "type": "TEXT"
      },
      {
        "key": "targetCollection",
        "displayName": "Target Collection",
        "type": "TEXT"
      },
      {
        "key": "targetId",
        "displayName": "Target Record ID",
        "type": "TEXT"
      },
      {
        "key": "targetLabel",
        "displayName": "Target Label",
        "type": "TEXT"
      },
      {
        "key": "before",
        "displayName": "Before (JSON)",
        "type": "TEXT"
      },
      {
        "key": "after",
        "displayName": "After (JSON)",
        "type": "TEXT"
      },
      {
        "key": "diff",
        "displayName": "Diff (JSON)",
        "type": "TEXT"
      },
      {
        "key": "note",
        "displayName": "Note",
        "type": "TEXT"
      },
      {
        "key": "ipAddress",
        "displayName": "IP Address",
        "type": "TEXT"
      },
      {
        "key": "sessionToken",
        "displayName": "Session Token",
        "type": "TEXT"
      },
      {
        "key": "occurredAt",
        "displayName": "Occurred At",
        "type": "DATETIME"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "StaffCredentials",
    "displayName": "Staff Credentials",
    "fields": [
      {
        "key": "staffId",
        "displayName": "Staff User ID",
        "type": "TEXT"
      },
      {
        "key": "username",
        "displayName": "Username",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "passwordHash",
        "displayName": "Password Hash",
        "type": "TEXT"
      },
      {
        "key": "passwordChangedAt",
        "displayName": "Password Changed At",
        "type": "DATETIME"
      },
      {
        "key": "resetToken",
        "displayName": "Reset Token",
        "type": "TEXT"
      },
      {
        "key": "resetTokenExpiresAt",
        "displayName": "Reset Token Expires At",
        "type": "DATETIME"
      },
      {
        "key": "failedAttempts",
        "displayName": "Failed Login Attempts",
        "type": "NUMBER"
      },
      {
        "key": "lockedUntil",
        "displayName": "Locked Until",
        "type": "DATETIME"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "StaffPreferences",
    "displayName": "Staff Preferences",
    "fields": [
      {
        "key": "staffId",
        "displayName": "Staff User ID",
        "type": "TEXT"
      },
      {
        "key": "username",
        "displayName": "Username",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "defaultView",
        "displayName": "Default View",
        "type": "TEXT"
      },
      {
        "key": "timezone",
        "displayName": "Timezone",
        "type": "TEXT"
      },
      {
        "key": "language",
        "displayName": "Language",
        "type": "TEXT"
      },
      {
        "key": "tablePageSize",
        "displayName": "Table Page Size",
        "type": "NUMBER"
      },
      {
        "key": "sidebarCollapsed",
        "displayName": "Sidebar Collapsed",
        "type": "BOOLEAN"
      },
      {
        "key": "notifications",
        "displayName": "Notification Settings",
        "type": "TEXT"
      },
      {
        "key": "dashboardWidgets",
        "displayName": "Dashboard Widgets",
        "type": "TEXT"
      },
      {
        "key": "customData",
        "displayName": "Custom Data",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "StaffRoles",
    "displayName": "Staff Roles",
    "fields": [
      {
        "key": "key",
        "displayName": "Key (slug)",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Label",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "permissions",
        "displayName": "Permissions (JSON)",
        "type": "TEXT"
      },
      {
        "key": "isSystemRole",
        "displayName": "System Role",
        "type": "BOOLEAN"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "StaffSessions",
    "displayName": "Staff Sessions",
    "fields": [
      {
        "key": "staffId",
        "displayName": "Staff User ID",
        "type": "TEXT"
      },
      {
        "key": "username",
        "displayName": "Username",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "token",
        "displayName": "Session Token",
        "type": "TEXT"
      },
      {
        "key": "roleKey",
        "displayName": "Role Key",
        "type": "TEXT"
      },
      {
        "key": "permissions",
        "displayName": "Permissions (JSON)",
        "type": "TEXT"
      },
      {
        "key": "createdAt",
        "displayName": "Created At",
        "type": "DATETIME"
      },
      {
        "key": "expiresAt",
        "displayName": "Expires At",
        "type": "DATETIME"
      },
      {
        "key": "lastActiveAt",
        "displayName": "Last Active At",
        "type": "DATETIME"
      },
      {
        "key": "ipAddress",
        "displayName": "IP Address",
        "type": "TEXT"
      },
      {
        "key": "userAgent",
        "displayName": "User Agent",
        "type": "TEXT"
      },
      {
        "key": "revoked",
        "displayName": "Revoked",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "StaffUsers",
    "displayName": "Staff Users",
    "fields": [
      {
        "key": "username",
        "displayName": "Username",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "fullName",
        "displayName": "Full Name",
        "type": "TEXT"
      },
      {
        "key": "email",
        "displayName": "Email",
        "type": "TEXT"
      },
      {
        "key": "phone",
        "displayName": "Phone",
        "type": "TEXT"
      },
      {
        "key": "roleId",
        "displayName": "Role ID",
        "type": "TEXT"
      },
      {
        "key": "roleKey",
        "displayName": "Role Key",
        "type": "TEXT"
      },
      {
        "key": "roleLabel",
        "displayName": "Role Label",
        "type": "TEXT"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "lastLoginAt",
        "displayName": "Last Login At",
        "type": "DATETIME"
      },
      {
        "key": "lastLoginIp",
        "displayName": "Last Login IP",
        "type": "TEXT"
      },
      {
        "key": "forcePasswordReset",
        "displayName": "Force Password Reset",
        "type": "BOOLEAN"
      },
      {
        "key": "avatarUrl",
        "displayName": "Avatar URL",
        "type": "URL"
      },
      {
        "key": "notes",
        "displayName": "Notes",
        "type": "TEXT"
      },
      {
        "key": "createdBy",
        "displayName": "Created By",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "SupportTickets",
    "displayName": "Support Tickets",
    "fields": [
      {
        "key": "ticketNumber",
        "displayName": "Ticket Number",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "subject",
        "displayName": "Subject",
        "type": "TEXT"
      },
      {
        "key": "status",
        "displayName": "Status",
        "type": "TEXT"
      },
      {
        "key": "priority",
        "displayName": "Priority",
        "type": "TEXT"
      },
      {
        "key": "category",
        "displayName": "Category",
        "type": "TEXT"
      },
      {
        "key": "customerId",
        "displayName": "Customer ID",
        "type": "TEXT"
      },
      {
        "key": "customerName",
        "displayName": "Customer Name",
        "type": "TEXT"
      },
      {
        "key": "customerEmail",
        "displayName": "Customer Email",
        "type": "TEXT"
      },
      {
        "key": "customerPhone",
        "displayName": "Customer Phone",
        "type": "TEXT"
      },
      {
        "key": "memberId",
        "displayName": "Wix Member ID",
        "type": "TEXT"
      },
      {
        "key": "bookingId",
        "displayName": "Booking ID",
        "type": "TEXT"
      },
      {
        "key": "bookingNumber",
        "displayName": "Booking Number",
        "type": "TEXT"
      },
      {
        "key": "source",
        "displayName": "Source",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "internalNotes",
        "displayName": "Internal Notes",
        "type": "TEXT"
      },
      {
        "key": "resolution",
        "displayName": "Resolution",
        "type": "TEXT"
      },
      {
        "key": "assignedStaffId",
        "displayName": "Assigned Staff ID",
        "type": "TEXT"
      },
      {
        "key": "assignedStaffName",
        "displayName": "Assigned Staff Name",
        "type": "TEXT"
      },
      {
        "key": "messages",
        "displayName": "Messages (JSON)",
        "type": "TEXT"
      },
      {
        "key": "openedAt",
        "displayName": "Opened At",
        "type": "DATETIME"
      },
      {
        "key": "firstResponseAt",
        "displayName": "First Response At",
        "type": "DATETIME"
      },
      {
        "key": "resolvedAt",
        "displayName": "Resolved At",
        "type": "DATETIME"
      },
      {
        "key": "closedAt",
        "displayName": "Closed At",
        "type": "DATETIME"
      },
      {
        "key": "dueAt",
        "displayName": "Due At",
        "type": "DATETIME"
      },
      {
        "key": "satisfactionRating",
        "displayName": "Satisfaction Rating",
        "type": "NUMBER"
      },
      {
        "key": "tags",
        "displayName": "Tags",
        "type": "TEXT"
      }
    ],
    "permissions": {
      "read": "ADMIN",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  },
  {
    "_id": "VehiclesNew",
    "displayName": "Vehicle Categories",
    "fields": [
      {
        "key": "category",
        "displayName": "Category Code",
        "type": "TEXT"
      },
      {
        "key": "title",
        "displayName": "Title",
        "type": "TEXT"
      },
      {
        "key": "label",
        "displayName": "Short Label",
        "type": "TEXT"
      },
      {
        "key": "displayTitle",
        "displayName": "Display Title",
        "type": "TEXT"
      },
      {
        "key": "description",
        "displayName": "Description",
        "type": "TEXT"
      },
      {
        "key": "badge",
        "displayName": "Badge",
        "type": "TEXT"
      },
      {
        "key": "image",
        "displayName": "Image",
        "type": "IMAGE"
      },
      {
        "key": "imageUrl",
        "displayName": "Image URL",
        "type": "URL"
      },
      {
        "key": "price",
        "displayName": "Base Price / Day",
        "type": "NUMBER"
      },
      {
        "key": "seats",
        "displayName": "Seats",
        "type": "TEXT"
      },
      {
        "key": "doors",
        "displayName": "Doors",
        "type": "TEXT"
      },
      {
        "key": "luggage",
        "displayName": "Luggage",
        "type": "TEXT"
      },
      {
        "key": "transmission",
        "displayName": "Transmission",
        "type": "TEXT"
      },
      {
        "key": "fuelType",
        "displayName": "Fuel Type",
        "type": "TEXT"
      },
      {
        "key": "airCondition",
        "displayName": "Air Conditioning",
        "type": "BOOLEAN"
      },
      {
        "key": "sortOrder",
        "displayName": "Sort Order",
        "type": "NUMBER"
      },
      {
        "key": "active",
        "displayName": "Active",
        "type": "BOOLEAN"
      },
      {
        "key": "status",
        "displayName": "Status",
        "type": "TEXT"
      },
      {
        "key": "publicVisible",
        "displayName": "Public Visible",
        "type": "BOOLEAN"
      }
    ],
    "permissions": {
      "read": "ANYONE",
      "insert": "ADMIN",
      "update": "ADMIN",
      "remove": "ADMIN"
    }
  }
];
