public class InvestmentPlannerController {

    @AuraEnabled(cacheable=true)
    public static List<ETF__c> getETFs() {
        try {
            return [SELECT Id, Name, Market__c, Ticker_Symbol__c, Allocation__c FROM ETF__c];
        }
        catch(Exception e) {
            throw new AuraHandledException('Exception occurred in getETFs(): ' + e.getMessage());
        }
    }

}