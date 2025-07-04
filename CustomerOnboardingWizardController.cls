public with sharing class CustomerOnboardingWizardController {
    @AuraEnabled
    public static Id uploadFileToAccount(String parentId, String fileName, String base64Data, String contentType) {
        // Decode the base64 file
        Blob fileBody;
        try {
            fileBody = EncodingUtil.base64Decode(base64Data);
        } catch (Exception e) {
            throw new AuraHandledException('Failed to decode file: ' + e.getMessage());
        }
        // Create ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = '/' + fileName;
        cv.VersionData = fileBody;
        cv.Origin = 'H';
        cv.ContentLocation = 'S';
        insert cv;
        // Query ContentDocumentId
        cv = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        // Link to Account
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = cv.ContentDocumentId;
        cdl.LinkedEntityId = parentId;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
        return cv.ContentDocumentId;
    }

    @AuraEnabled
    public static Map<String, Object> createAccountAndContact(
        Map<String, Object> accountFields,
        Map<String, Object> contactFields,
        Map<String, Object> financeContactFields,
        Map<String, Object> hrContactFields,
        Map<String, Object> emergencyContactFields
    ) {
        Map<String, Object> response = new Map<String, Object>();
        Savepoint sp;
        try {
            sp = Database.setSavepoint();
            // Create Account
            Account acc = new Account();
            for (String key : accountFields.keySet()) {
                if(key == 'Advance_Booking_Window__c'){
                    acc.put(key, Integer.valueOf(accountFields.get(key)));
                }else if(key == 'Agreement_Start_Date__c' || key == 'Agreement_End_Date__c'){
                    acc.put(key, Date.valueOf((String)accountFields.get(key)));
                }else{
                    acc.put(key, accountFields.get(key));
                }
            }
            insert acc;
            // Create Primary Contact
            Contact con = new Contact();
            for (String key : contactFields.keySet()) {
                con.put(key, contactFields.get(key));
            }
            con.AccountId = acc.Id;
            insert con;
            // Create Finance Contact if provided
            if (financeContactFields != null &&
                ((financeContactFields.containsKey('Email') && String.valueOf(financeContactFields.get('Email')).trim() != '') ||
                 (financeContactFields.containsKey('Phone') && String.valueOf(financeContactFields.get('Phone')).trim() != '')) ) {
                Contact finance = new Contact();
                for (String key : financeContactFields.keySet()) {
                    finance.put(key, financeContactFields.get(key));
                }
                finance.AccountId = acc.Id;
                finance.FirstName = 'Finance';
                finance.LastName = 'Contact';
                finance.Title = 'Finance Admin';
                finance.Is_Primary_Contact__c = false;
                insert finance;
                response.put('financeContactId', finance.Id);
            }
            // Create HR Contact if provided
            if (hrContactFields != null &&
                ((hrContactFields.containsKey('Email') && String.valueOf(hrContactFields.get('Email')).trim() != '') ||
                 (hrContactFields.containsKey('Phone') && String.valueOf(hrContactFields.get('Phone')).trim() != '')) ) {
                Contact hr = new Contact();
                for (String key : hrContactFields.keySet()) {
                    hr.put(key, hrContactFields.get(key));
                }
                hr.AccountId = acc.Id;
                hr.FirstName = 'HR';
                hr.LastName = 'Contact';
                hr.Title = 'HR Admin';
                hr.Is_Primary_Contact__c = false;
                insert hr;
                response.put('hrContactId', hr.Id);
            }
            // Create Emergency Contact if provided
            if (emergencyContactFields != null &&
                ((emergencyContactFields.containsKey('Email') && String.valueOf(emergencyContactFields.get('Email')).trim() != '') ||
                 (emergencyContactFields.containsKey('Phone') && String.valueOf(emergencyContactFields.get('Phone')).trim() != '')) ) {
                Contact emergency = new Contact();
                for (String key : emergencyContactFields.keySet()) {
                    emergency.put(key, emergencyContactFields.get(key));
                }
                emergency.AccountId = acc.Id;
                emergency.FirstName = 'Emergency';
                emergency.LastName = 'Contact';
                emergency.Title = 'Emergency Admin';
                emergency.Is_Primary_Contact__c = false;
                insert emergency;
                response.put('emergencyContactId', emergency.Id);
            }
            response.put('success', true);
            response.put('accountId', acc.Id);
            response.put('contactId', con.Id);
        } catch (Exception e) {
            if (sp != null) Database.rollback(sp);
            response.put('success', false);
            response.put('error', e.getMessage());
        }
        return response;
    }
}