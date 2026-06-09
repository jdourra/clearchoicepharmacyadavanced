import csv
import re
import json

# Read the CSV file from user attachments
csv_path = '../user_read_only_context/text_attachments/csv-drug-report-KPpVh.csv'

medications = []
med_id = 1

print("Parsing medications from CSV...")

with open(csv_path, 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    
    for row in csv_reader:
        if len(row) < 4:
            continue
            
        drug_name = row[0].strip()
        quantity_str = row[1].strip()
        ndc = row[2].strip()
        aac_str = row[3].strip()
        
        # Skip if empty or invalid
        if not drug_name or not quantity_str or not ndc:
            continue
            
        # Parse quantity
        try:
            quantity = int(quantity_str)
        except:
            continue
            
        # Parse AAC (acquisition cost)
        try:
            aac = float(aac_str) if aac_str else 0.0
        except:
            aac = 0.0
            
        # Skip if no cost
        if aac == 0.0:
            continue
            
        # Calculate per unit cost
        per_unit_cost = round(aac / quantity, 5)
        
        # Parse medication name and strength from drug_name
        # Example: "LOSARTAN-HCTZ 100-25 MG TAB"
        name_parts = drug_name.split()
        
        # Extract form (TAB, CAP, etc.)
        form = "TABLET"
        for part in reversed(name_parts):
            if part in ["TAB", "TABLET", "CAP", "CAPSULE", "CP", "TB"]:
                form = part.replace("TAB", "TABLET").replace("CAP", "CAPSULE").replace("CP", "CAPSULE").replace("TB", "TABLET")
                break
        
        # Extract strength (everything with MG, MCG, %, etc.)
        strength = ""
        strength_parts = []
        for i, part in enumerate(name_parts):
            if "MG" in part or "MCG" in part or "%" in part or any(char.isdigit() for char in part):
                # Check if next part is unit
                if i + 1 < len(name_parts) and name_parts[i + 1] in ["MG", "MCG", "ML", "%"]:
                    strength_parts.append(f"{part} {name_parts[i + 1]}")
                elif "MG" in part or "MCG" in part or "%" in part:
                    strength_parts.append(part)
                elif i + 1 < len(name_parts) and (name_parts[i + 1] == "MG" or name_parts[i + 1] == "MCG"):
                    strength_parts.append(f"{part} {name_parts[i + 1]}")
        
        strength = " ".join(strength_parts) if strength_parts else "N/A"
        
        # Extract medication name (everything before strength)
        name = drug_name
        for part in strength_parts:
            name = name.replace(part, "")
        name = name.replace(form, "").strip()
        
        # Clean up name
        name = re.sub(r'\s+', ' ', name).strip()
        
        # Create medication object
        medication = {
            "id": f"med_{med_id:04d}",
            "name": name,
            "strength": strength,
            "form": form,
            "ndc": ndc,
            "quantity": quantity,
            "acquisition_cost": round(aac, 2),
            "per_unit_cost": per_unit_cost,
            "is_generic": True
        }
        
        medications.append(medication)
        med_id += 1

print(f"Parsed {len(medications)} medications")

# Generate TypeScript file
ts_content = '''// Auto-generated from CSV - DO NOT EDIT MANUALLY
export interface Medication {
  id: string
  name: string
  strength: string
  form: string
  ndc: string
  quantity: number
  acquisition_cost: number
  per_unit_cost: number
  is_generic: boolean
}

export const allMedications: Medication[] = [
'''

# Add all medications
for med in medications:
    ts_content += f'''  {{
    id: "{med['id']}",
    name: "{med['name']}",
    strength: "{med['strength']}",
    form: "{med['form']}",
    ndc: "{med['ndc']}",
    quantity: {med['quantity']},
    acquisition_cost: {med['acquisition_cost']},
    per_unit_cost: {med['per_unit_cost']},
    is_generic: {str(med['is_generic']).lower()}
  }},
'''

ts_content += ''']

export function searchMedications(query: string): Medication[] {
  if (!query || query.length < 3) return []
  
  const searchTerm = query.toLowerCase()
  return allMedications.filter(med => 
    med.name.toLowerCase().startsWith(searchTerm)
  )
}

export function getUniqueMedicationNames(): string[] {
  const names = new Set<string>()
  allMedications.forEach(med => names.add(med.name))
  return Array.from(names).sort()
}

export function getMedicationsByName(name: string): Medication[] {
  return allMedications.filter(med => med.name === name)
}

export function getMedicationById(id: string): Medication | undefined {
  return allMedications.find(med => med.id === id)
}
'''

# Write to file
output_path = '../lib/all-medications.ts'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated {output_path} with {len(medications)} medications")
print("✓ Complete!")
