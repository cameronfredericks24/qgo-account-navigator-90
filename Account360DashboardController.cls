public with sharing class Account360DashboardController {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchKey) {
        if (String.isBlank(searchKey)) {
            return [SELECT Id, Name FROM Account LIMIT 5];
        }
        return [SELECT Id, Name FROM Account WHERE Name LIKE :('%' + searchKey + '%') LIMIT 10];
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAccountBookingSummary(Id accountId) {
        Map<String, Object> result = new Map<String, Object>();
        if (accountId == null) return result;

        // Total Bookings
        Integer totalBookings = [SELECT COUNT() FROM Booking__c WHERE Account__c = :accountId];
        // Total Booking Amount
        AggregateResult[] totalAmountAgg = [SELECT SUM(Total_Booking_Amount__c) totalAmount FROM Booking__c WHERE Account__c = :accountId];
        Decimal totalAmount = (totalAmountAgg.size() > 0 && totalAmountAgg[0].get('totalAmount') != null) ? (Decimal)totalAmountAgg[0].get('totalAmount') : 0;
        // Total Flight Bookings
        Integer totalFlightBookings = [SELECT COUNT() FROM Booking__c WHERE Account__c = :accountId AND Booking_Type__c INCLUDES ('Flight')];
        // Total Hotel Bookings
        Integer totalHotelBookings = [SELECT COUNT() FROM Booking__c WHERE Account__c = :accountId AND Booking_Type__c INCLUDES ('Hotel')];
        // Total Revenue (using Total_Booking_Amount__c)
        Decimal totalRevenue = totalAmount;

        // Booking Status Snapshot
        Map<String, Integer> statusCounts = new Map<String, Integer>();
        for (AggregateResult ar : [SELECT Booking_Status__c status, COUNT(Id) cnt FROM Booking__c WHERE Account__c = :accountId GROUP BY Booking_Status__c]) {
            statusCounts.put((String)ar.get('status'), (Integer)ar.get('cnt'));
        }

        result.put('totalBookings', totalBookings);
        result.put('totalAmount', totalAmount);
        result.put('totalFlightBookings', totalFlightBookings);
        result.put('totalHotelBookings', totalHotelBookings);
        result.put('totalRevenue', totalRevenue);
        result.put('statusCounts', statusCounts);
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static Account getAccountDetails(Id accountId) {
        return [
            SELECT Id, Name, AccountNumber, Type, Industry, Phone, NumberOfEmployees
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAccount360Details(Id accountId) {
        Map<String, Object> result = new Map<String, Object>();
        if (accountId == null) return result;

        // Fetch Account basic details
        Account acc = [SELECT Id, Name, AccountNumber, Type, Industry FROM Account WHERE Id = :accountId LIMIT 1];
        result.put('Name', acc.Name);
        result.put('AccountNumber', acc.AccountNumber);
        result.put('Type', acc.Type);
        result.put('Industry', acc.Industry);

        // Fetch Primary Contact (first and last name)
        List<Contact> contacts = [SELECT FirstName, LastName FROM Contact WHERE AccountId = :accountId AND Is_Primary_Contact__c = true LIMIT 1];
        if (!contacts.isEmpty()) {
            result.put('ContactFirstName', contacts[0].FirstName);
            result.put('ContactLastName', contacts[0].LastName);
        } else {
            result.put('ContactFirstName', null);
            result.put('ContactLastName', null);
        }

        // Sum Number_of_Travelers__c from all bookings for this account
        AggregateResult[] agg = [SELECT SUM(Number_of_Travelers__c) totalPassengers FROM Booking__c WHERE Account__c = :accountId];
        Integer totalPassengers = (agg.size() > 0 && agg[0].get('totalPassengers') != null) ? (Integer)agg[0].get('totalPassengers') : 0;
        result.put('TotalPassengers', totalPassengers);

        return result;
    }
} 