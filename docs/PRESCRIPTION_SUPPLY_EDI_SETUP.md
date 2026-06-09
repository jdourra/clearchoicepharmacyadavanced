# Prescription Supply EDI Configuration Guide

## Overview
Prescription Supply Inc. uses Electronic Data Interchange (EDI) for automated ordering and invoicing. This guide will help you configure EDI integration with Prescription Supply for your pharmacy.

## Required EDI Transactions

### 1. EDI 850 - Purchase Order (Outbound)
**Purpose:** Send orders to Prescription Supply electronically
**When:** Automatically when inventory reaches reorder point or manual orders

**Data Elements:**
- Purchase Order Number
- Buyer Information (Your pharmacy DEA, HIN, account number)
- Supplier Information (Prescription Supply)
- Item Details (NDC codes, quantities)
- Delivery date and shipping address
- Pricing information

### 2. EDI 810 - Invoice (Inbound)
**Purpose:** Receive invoices from Prescription Supply
**When:** After order is shipped

### 3. EDI 856 - Advance Ship Notice (Inbound) - Optional
**Purpose:** Receive shipping notifications before delivery
**When:** When order ships from warehouse

### 4. EDI 855 - Purchase Order Acknowledgment (Inbound) - Optional
**Purpose:** Receive confirmation that your order was received
**When:** After Prescription Supply receives your PO

## Setup Options

### Option 1: Direct EDI Connection (Requires IT Infrastructure)
**Requirements:**
- EDI software/platform (AS2, VAN, or FTP)
- Technical staff to manage EDI translations
- Direct connection agreement with Prescription Supply

**Steps:**
1. Contact Prescription Supply at 1-800-671-7006
2. Request EDI setup and obtain:
   - EDI contact information
   - Trading partner ID
   - Connection method (AS2, VAN, or FTP)
   - EDI specifications document
3. Configure your EDI software with their specifications
4. Complete EDI testing phase
5. Go live

### Option 2: EDI Service Provider (Recommended for Most Pharmacies)
**Advantages:**
- No technical staff required
- Faster setup (days instead of months)
- Cloud-based portal access
- Support included
- Integrates with pharmacy software

**Popular EDI Providers:**
- **DataTrans Solutions** - WebEDI platform
- **SPS Commerce**
- **TrueCommerce**
- **1 EDI Source**

**Steps:**
1. Choose an EDI provider (DataTrans is specifically mentioned for Prescription Supply)
2. Sign up for their service
3. Provide your pharmacy information:
   - DEA number
   - HIN (Health Industry Number)
   - Prescription Supply account number
   - Shipping addresses
4. Provider configures connection to Prescription Supply
5. Test orders (typically 2-5 test transactions)
6. Go live

### Option 3: Pharmacy Management System Integration
**Many pharmacy management systems have built-in EDI:**
- QS/1
- PioneerRx
- Liberty Software
- BestRx
- Micro Merchant Systems

**Steps:**
1. Check if your pharmacy system supports EDI with Prescription Supply
2. Contact your software vendor for setup
3. Provide Prescription Supply account information
4. Enable EDI ordering in your system settings

## Information Needed from Prescription Supply

Before setting up EDI, gather this information:

1. **Account Details:**
   - Prescription Supply account number
   - Customer ID
   - Ship-to locations

2. **Technical Details:**
   - Trading partner ID/ISA ID
   - Connection method preference
   - EDI contact person (name, email, phone)
   - EDI specifications document

3. **Business Details:**
   - Order cutoff times
   - Delivery schedule
   - Minimum order requirements
   - Return procedures via EDI

## Contact Information

**Prescription Supply Inc.**
- Phone: 1-800-671-7006
- Website: https://prescriptionsupply.com
- Request EDI setup department

## Benefits of EDI with Prescription Supply

✅ **Faster ordering** - Orders transmitted in seconds
✅ **Reduced errors** - Eliminates manual data entry mistakes
✅ **Automated inventory** - Reorder automatically when stock is low
✅ **Better pricing** - Real-time price updates via EDI 832
✅ **Order tracking** - Automatic shipping notifications
✅ **Lower costs** - Reduce staff time on ordering

## Integration with This Application

This pharmacy application is designed to work with EDI. Once EDI is configured:

1. **Automatic Price Updates:** Daily price file (EDI 832) updates medication costs
2. **Inventory Management:** System generates EDI 850 purchase orders automatically
3. **Order Tracking:** EDI 856 ship notices update order status
4. **Invoice Reconciliation:** EDI 810 invoices matched to orders

## Next Steps

1. **Contact Prescription Supply** - Call 1-800-671-7006 and ask for EDI setup
2. **Choose your method** - Direct, provider, or pharmacy system integration
3. **Gather information** - Collect all account and technical details
4. **Complete setup** - Follow steps for your chosen method
5. **Test thoroughly** - Run test orders before going live
6. **Train staff** - Ensure staff understands the new ordering process

## Estimated Timeline

- **EDI Provider Method:** 1-2 weeks
- **Direct Connection:** 4-8 weeks
- **Pharmacy System Integration:** 2-4 weeks

## Costs

- **Direct EDI:** $500-2,000 setup + $100-500/month
- **EDI Provider:** $100-300/month (often includes setup)
- **Pharmacy System:** Usually included, may be $50-200/month

## Support

For technical issues with this application's EDI features:
- Check the `/app/staff/edi-orders` page for order status
- Review EDI logs in the staff dashboard
- Contact your EDI provider for transmission issues
