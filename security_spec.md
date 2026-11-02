# Security Specification - Adrian C Logística Integral

## 1. Data Invariants
- Vehicle IDs, Driver IDs, Route IDs, Package IDs, Maintenance IDs, and Notification IDs must be non-empty strings conforming to regex `^[a-zA-Z0-9_\-]+$`.
- Packages contain tracking numbers (e.g. `AC-8941`) and remito numbers that allow public tracking lookups while restricting administrative modifications to authorized operations.
- Digital signatures captured during delivery validation must be verified and once a package reaches the terminal state `Entregado`, delivery fields become immutable to prevent tampering with delivered consignments.
- Maintenance records must reference an existing vehicle identifier.
- Routes must enforce that total packages and delivered packages are non-negative numeric figures.

## 2. The Dirty Dozen Payloads (Targeting Vulnerabilities)
1. **Empty Document ID Injection**: Attempt to create a vehicle with an empty or non-alphanumeric ID `../inject/fail`.
2. **Payload Size Poisoning**: Package with delivery notes or descriptions exceeding maximum string boundary (1MB attack string).
3. **Unsanitized Status Shortcutting**: Attempting to set an invalid arbitrary status `HACKED_STATUS` on a route or package.
4. **Terminal State Tampering**: Modifying the digital signature or recipient data on a package that is already in terminal state `Entregado`.
5. **Ghost Field Injection (Shadow Update)**: Submitting a valid vehicle payload with an unauthorized extra property `_admin_override: true`.
6. **Negative Numerics Poisoning**: Submitting a maintenance ticket with negative cost `-50000` or negative odometer readings.
7. **Cross-Tenant ID Impersonation**: Forging author identity on notification dispatches.
8. **Malicious Script in Tracking Code**: Injecting `<script>alert(1)</script>` inside trackingNumber or remitoNumber.
9. **Zero-Length Required Fields**: Submitting driver profile with missing license category or empty full name.
10. **Odometer Rollback Exploit**: Updating vehicle odometer with a figure less than 0 or NaN.
11. **Mass Deletion Attempt**: Unauthenticated client executing collection batch deletion.
12. **Blanket Query Scraping**: Malicious client attempting to scrape entire driver PII without bounded queries.
