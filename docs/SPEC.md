Vehicle Asset Registry and Monitoring System (VARMS)

System Specification Draft

1. Purpose

The Vehicle Asset Registry and Monitoring System (VARMS) is a centralized government platform designed to create full traceability for every vehicle imported into or sold within Zimbabwe. Its purpose is to close regulatory gaps by enforcing dealer registration, recording financial flows around vehicle sales, tracking beneficial ownership, and preventing vehicles from being registered unless their full transaction history is captured in the system.

2. Scope

VARMS covers the full vehicle lifecycle from border entry, to dealer inventory, to sale, to final road registration, with oversight by the Financial Intelligence Unit (FIU). The platform applies to all registered car dealerships, ZIMRA border officials, Central Vehicle Registry (CVR) officers, and FIU analysts.

3. System Objectives

The system shall:

ensure that every imported vehicle has a verified digital record before release from the border;
require all dealerships to be registered and licensed before they can trade through the system;
record all sales in real time, including buyer identity and proof of payment;
detect suspicious transactions such as high-value cash payments, nominee buyer patterns, repeated rapid resale, and pricing inconsistencies;
prevent registration of any vehicle that does not have a complete traceable chain of import and sale;
provide FIU with read-only monitoring, alerting, and audit capability across the full ecosystem.
4. Key Stakeholders and User Roles

ZIMRA officers capture imported vehicle details at the border and release vehicles only after successful logging into VARMS.
Registered dealerships manage inventory and record all sales transactions.
CVR officers verify transaction history before approving registration for road use.
FIU officers monitor dashboards, review alerts, and investigate suspicious patterns.
System administrators manage user accounts, permissions, dealership licensing status, thresholds, and audit settings. The administrator role is an implementation necessity derived from the guide.

5. High-Level Business Rules
A vehicle shall not enter the legal market unless it is first recorded in VARMS by ZIMRA.
A vehicle shall not be removed from dealership inventory unless a valid sale record is completed.
A vehicle shall not be registered by CVR unless its import and sale history exist and are valid in VARMS.
A dealership shall not transact in VARMS unless it is registered and licensed.
Any cash transaction above US$10,000 shall automatically trigger a Suspicious Transaction Report (STR) to the FIU.
A buyer presenting repeated high-value vehicle purchases within a short period shall be flagged for FIU review as a possible nominee buyer pattern.
6. Functional Requirements
6.1 Dealer Registry and Licensing Module

The system shall maintain a registry of all approved car dealerships.
The system shall store dealership details including legal name, license number, physical address, contact information, status, and date of approval.
The system shall allow only active and licensed dealerships to receive imported vehicles into inventory or record sales.
The system shall allow administrators to suspend, revoke, or reactivate dealership access. This module is required because the guide makes dealership registration and licensing a core control objective.

6.2 ZIMRA Border Intake Module

The system shall allow ZIMRA officers to register a vehicle at the point of importation before release from the border.
The required fields shall include VIN, make, model, declared value, country of origin, and importing dealership identity.
On successful submission, the vehicle shall automatically be added to the importing dealership’s inventory.
The system shall reject incomplete or duplicate VIN entries.
The system shall store the border entry timestamp and officer identity for audit purposes.

6.3 Dealership Inventory Module

The system shall maintain a live inventory ledger for each dealership.
Each vehicle record shall show import source, current status, acquisition date, sale status, and linked transaction history.
A dealership shall be able to view only its own inventory, while FIU and authorized regulators shall have broader read access according to role permissions.
A vehicle shall remain in inventory until a valid sale is completed and approved by business rules.

6.4 Sales Recording Module

The system shall require every dealership to record vehicle sales in real time.
For each sale, the dealership shall capture buyer full name, national ID, sale price, payment type, proof of payment, transaction date, and whether the buyer is acting for another person.
The system shall support capture of beneficial ownership information where a buyer acts on behalf of another individual or entity.
The system shall prevent completion of the sale process if required fields are missing.
The system shall automatically update inventory status once a compliant sale is submitted.

6.5 Suspicious Transaction Reporting Module

The system shall automatically generate an STR when a cash payment exceeds US$10,000.
The system shall notify the FIU immediately when an STR is created.
The system shall record the alert reason, linked vehicle, dealership, buyer, value, timestamp, and status of review.
The system shall support additional automated risk rules such as unusually high cash activity by a dealership, rapid repeat resale of the same vehicle, disparity between import value and sale value, and multiple purchases linked to one buyer.

6.6 Beneficial Ownership and Nominee Buyer Detection

The system shall store information on whether a buyer is acting on behalf of another person.
The system shall support beneficial owner details where declared.
The system shall flag cases where the same person appears as buyer across multiple high-value registrations within a short period.
The system shall present these cases to FIU as potential nominee buyer arrangements.

6.7 CVR Registration Control Module

The system shall allow CVR officers to search for a vehicle by VIN or transaction reference.
Before registration approval, the system shall verify that:

the vehicle was logged by ZIMRA;
the vehicle belongs to a registered dealership trail;
a valid sales record exists;
the person seeking registration matches the buyer in the sales record.
If validation fails, registration shall be blocked and the officer shall be shown the reason.
If validation succeeds, the system shall mark the vehicle as eligible for registration and record the final registration event.
6.8 FIU Oversight and Monitoring Module

The system shall provide FIU with full read-only access to vehicles, dealerships, sales, alerts, and audit trails.
The FIU dashboard shall display all registered dealerships, active inventory, completed sales, suspicious transactions, and trend indicators.
The FIU shall be able to filter data by dealership, buyer, VIN, date range, payment type, risk status, and transaction value.
The system shall support risk-based audits of high-risk dealerships and transaction types.

6.9 Audit and Compliance Module

The system shall log every important action, including vehicle creation, edit, sale submission, alert generation, registration verification, and user login.
Audit logs shall include user ID, role, timestamp, source module, and before/after values for changed records where applicable.
Audit logs shall be immutable to ordinary users.
The system shall support export of compliance reports for authorized regulators. This requirement is implied by the oversight and monitoring functions described in the guide.

7. Data Entities
Core entities
Dealership: dealership_id, name, license_number, status, address, contacts, created_at
User: user_id, name, role, agency, username, password_hash, status
Vehicle: vehicle_id, VIN, make, model, declared_value, country_of_origin, import_date, dealership_id, status
Import Record: import_id, vehicle_id, ZIMRA_officer_id, border_post, timestamp
Sale Transaction: sale_id, vehicle_id, dealership_id, buyer_id, sale_price, payment_type, proof_of_payment, sale_date
Buyer: buyer_id, full_name, national_id, contact_details
Beneficial Owner: beneficial_owner_id, linked_buyer_id, full_name, national_id, relationship_type
STR Alert: alert_id, alert_type, source_record_id, reason, severity, status, created_at
Registration Record: registration_id, vehicle_id, buyer_id, CVR_officer_id, registration_date, status
Audit Log: log_id, user_id, action, entity_type, entity_id, timestamp, metadata
8. Main Workflow
Import stage: ZIMRA logs the vehicle and assigns it to a dealership inventory record.
Inventory stage: the dealership can view but not remove the vehicle until a sale is recorded.
Sale stage: the dealership captures buyer, price, payment, and beneficial ownership details.
Risk stage: the system evaluates rules and generates an STR where applicable.
Registration stage: CVR validates the full chain and either approves or blocks registration.
Oversight stage: FIU monitors all transactions, alerts, and trends through dashboards and reports.
9. Non-Functional Requirements

A suitable implementation should include:

Security: role-based access control, strong authentication, encrypted data in transit and at rest, and tamper-resistant audit logging.
Availability: the platform should be reliably available to ZIMRA, dealerships, CVR, and FIU during working operations.
Performance: validation for CVR registration should return quickly enough for real-time officer use.
Scalability: the system should support growth in dealerships, imported vehicles, and transaction volume.
Integrity: VINs should be unique, records should be versioned where edited, and critical records should not be deletable by standard users.
Traceability: every vehicle should maintain a complete end-to-end digital chain.
These requirements are implementation-level extensions of the control model described in the guide.
10. Recommended Screens

A practical MVP should include:

login and access control;
dealership registration and licensing screen;
ZIMRA vehicle capture form;
dealership inventory dashboard;
vehicle sale capture form;
CVR validation and registration screen;
FIU monitoring dashboard;
STR review screen;
audit log and reports screen.
These screens directly reflect the operational journey described in your guide.
11. Suggested Integrations

For a stronger production design, VARMS should integrate with:

ZIMRA systems for import verification,
CVR systems for vehicle registration issuance,
National ID verification services for buyer identity validation,
banking or payment verification systems where proof of payment needs independent validation.
The first two are required by the guide’s operating model; the latter two are recommended implementation enhancements.
12. Acceptance Criteria

The system will be considered compliant with the intended design if:

a vehicle cannot be registered unless its ZIMRA import and dealership sale history exist;
a dealership cannot remove a vehicle from inventory without completing a sale record;
cash sales above US$10,000 trigger automatic STR creation;
FIU can view all alerts, vehicle histories, and dealership activity in one dashboard;
repeated high-value buyer patterns and pricing inconsistencies are detectable;
the prototype can demonstrate the full journey from border capture to final registration.
13. Concise Specification Statement

VARMS is a closed-loop regulatory traceability system for vehicles in Zimbabwe. It enforces dealership licensing, captures border imports, records vehicle sales, monitors beneficial ownership and payment risk, blocks unverified registrations, and provides FIU with centralized oversight and automated suspicious transaction alerts.