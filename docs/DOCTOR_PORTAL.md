# Clinician (doctor) portal

Doctors review patient intakes at a dedicated login — not the full pharmacy admin.

## URLs

| Portal | URL |
|---|---|
| Clinician login | `/doctor/login` |
| Intake queue | `/doctor/intakes` |
| Pharmacy admin | `/admin/login` |

## Change password

After signing in, open **Change password** in the clinician portal nav (`/doctor/change-password`), or update via Neon SQL (see below).


1. Run `scripts/033_clinician_role.sql` in the Neon SQL Editor (expands allowed roles + seeds a clinician user if missing).
2. Default seed (change immediately):
   - Email: `doctor@clearchoicepharmacy.com`
   - Password: `ChangeMeDoctor1!`
3. To use Dr. Dourra’s real email and a strong password:

```sql
UPDATE staff_users
SET email = 'hadidourra@gmail.com',
    password_hash = crypt('YOUR_STRONG_PASSWORD', gen_salt('bf')),
    full_name = 'Dr. Dourra',
    role = 'clinician',
    is_active = true
WHERE email = 'doctor@clearchoicepharmacy.com'
   OR email = 'hadidourra@gmail.com';
```

If `full_name` / `is_active` columns do not exist on your DB, use your actual column names (`first_name`/`last_name`/`active`) instead.

## Access rules

- Role `clinician` (or `doctor`) → clinician portal only (intakes + review + Rx PDF).
- Role `admin` → full pharmacy admin (also redirected to doctor portal if they open `/doctor/login`? No — admin login to doctor page is rejected with a message to use admin login).
- Clinician cannot access orders, customers, medications, etc.

## Email alerts

New clinical intake emails link to `/doctor/intakes`.
