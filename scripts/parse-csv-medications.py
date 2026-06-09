import csv
import json
import re

# Read CSV from user attachments
input_file = '../user_read_only_context/text_attachments/newdruglistbyaac-vKZ04.csv'
output_file = '../lib/medications-data.ts'

medications_dict = {}
medication_id = 1

print("📖 Reading CSV file...")

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        drug_name = row['Drug Name '].strip()
        ndc = row['NDC'].strip()
        quantity_str = row['Quantity'].strip()
        cost_str = row['cost'].strip()
        
        # Skip if essential data is missing
        if not drug_name or not ndc or not quantity_str or not cost_str:
            continue
            
        try:
            quantity = float(quantity_str)
            cost = float(cost_str)
        except ValueError:
            continue
        
        # Skip zero quantity or cost
        if quantity <= 0 or cost <= 0:
            continue
        
        # Calculate per-unit acquisition cost
        per_unit_cost = cost / quantity
        
        # Form mapping
        form_map = {
            'TAB': 'Tablet', 'TABLET': 'Tablet', 'CAP': 'Capsule', 'CAPSULE': 'Capsule',
            'CREAM': 'Cream', 'OINTMENT': 'Ointment', 'OINT': 'Ointment', 
            'LOTION': 'Lotion', 'GEL': 'Gel', 'SOLUTION': 'Solution', 'SOLN': 'Solution',
            'SOL': 'Solution', 'SUSP': 'Suspension', 'SUSPENSION': 'Suspension',
            'SYRUP': 'Syrup', 'INHALER': 'Inhaler', 'INH': 'Inhaler',
            'DROPS': 'Drops', 'DROP': 'Drops', 'SPRAY': 'Spray', 'SPRY': 'Spray',
            'PATCH': 'Patch', 'SYR': 'Syringe', 'SYRINGE': 'Syringe',
            'VIAL': 'Vial', 'INJECTION': 'Injection', 'INJ': 'Injection',
            'POWDER': 'Powder', 'LIQUID': 'Liquid', 'ELIXIR': 'Elixir',
            'SOFTGEL': 'Softgel', 'CHEW': 'Chewable', 'CHEWABLE': 'Chewable',
            'LOZ': 'Lozenge', 'LOZENGE': 'Lozenge', 'SUPPOSITORY': 'Suppository',
            'ODT': 'Disintegrating Tablet', 'ER': 'Extended Release', 'DR': 'Delayed Release'
        }
        
        # Extract form
        form = 'Other'
        name_upper = drug_name.upper()
        for abbr, full_form in form_map.items():
            if name_upper.endswith(' ' + abbr) or (' ' + abbr + ' ' in name_upper):
                form = full_form
                break
        
        # Extract strength (e.g., "10 MG", "0.5%", "100 UNIT")
        strength_pattern = r'\d+\.?\d*\s*(?:MG|MCG|GM|ML|%|UNIT|UNITS?|MCG/ML|MG/ML|MG/5\s*ML)'
        strength_match = re.search(strength_pattern, drug_name.upper())
        strength = strength_match.group(0).strip().title() if strength_match else ''
        
        # Clean base medication name
        base_name = drug_name.upper()
        
        # Remove form abbreviations
        for abbr in form_map.keys():
            base_name = re.sub(r'\s+' + abbr + r'\b', '', base_name, flags=re.IGNORECASE)
        
        # Remove strength
        if strength:
            base_name = base_name.replace(strength.upper(), '')
        
        # Remove common suffixes (ER, DR, HCL, etc.)
        suffixes = ['ER', 'DR', 'SR', 'XR', 'HCL', 'SULF', 'SULFATE', 'HBR', 'HYDROBROMIDE',
                   'SODIUM', 'POTASSIUM', 'CALCIUM', 'MAGNESIUM', 'MESYLATE', 'MES',
                   'TARTRATE', 'MALEATE', 'BESYLATE', 'PHOSPHATE', 'PHOS', 'PH']
        for suffix in suffixes:
            base_name = re.sub(r'\s+' + suffix + r'\b', '', base_name)
        
        # Clean up spacing and convert to title case
        base_name = ' '.join(base_name.split()).strip().title()
        
        # Handle empty names
        if not base_name:
            base_name = drug_name.split()[0].title()
        
        # Create unique key: name + strength + form
        med_key = f"{base_name}_{strength}_{form}".lower().replace(' ', '_').replace('/', '_')
        
        # Keep medication with lowest per-unit cost
        if med_key not in medications_dict or per_unit_cost < medications_dict[med_key]['per_unit_cost']:
            medications_dict[med_key] = {
                'id': f"med-{medication_id}",
                'name': base_name,
                'generic_name': base_name,
                'brand_name': None,
                'strength': strength if strength else 'N/A',
                'form': form,
                'ndc_code': ndc,
                'acquisition_cost': round(per_unit_cost, 4),
                'is_generic': True,
                'per_unit_cost': per_unit_cost
            }
            medication_id += 1

# Convert to list and sort by name
medications_list = sorted(medications_dict.values(), key=lambda x: x['name'])

# Remove per_unit_cost field (was just for comparison)
for med in medications_list:
    del med['per_unit_cost']

print(f"✅ Processed {len(medications_list)} unique medications from CSV")

# Generate TypeScript file content
ts_content = f"""// Auto-generated from supplier CSV data
// Contains {len(medications_list)} unique medications with real acquisition costs
// Generated on: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

export interface Medication {{
  id: string
  name: string
  generic_name: string | null
  brand_name: string | null
  strength: string
  form: string
  ndc_code: string
  acquisition_cost: number
  is_generic: boolean
}}

export const medicationsData: Medication[] = {json.dumps(medications_list, indent=2)}

// Helper function to search medications
export function searchMedications(query: string, limit: number = 10): Medication[] {{
  const lowerQuery = query.toLowerCase()
  return medicationsData
    .filter(med => 
      med.name.toLowerCase().includes(lowerQuery) ||
      (med.generic_name && med.generic_name.toLowerCase().includes(lowerQuery))
    )
    .slice(0, limit)
}}

// Helper function to get medication by ID
export function getMedicationById(id: string): Medication | undefined {{
  return medicationsData.find(med => med.id === id)
}}
"""

# Write to TypeScript file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"✅ Generated {output_file}")
print(f"📊 Total medications: {len(medications_list)}")
print(f"🏥 Ready to use in your app!")
