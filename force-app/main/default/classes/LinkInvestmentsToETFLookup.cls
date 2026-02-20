public class LinkInvestmentsToETFLookup {

    // This method updates the existing ETF Investment__c records with the corresponding ETF__c lookup value
    public static void linkInvestmentsToETF() {
        Map<String, Id> etfToIdMap = new Map<String, Id>();
        List<Investment__c> invRecsToUpdate = new List<Investment__c>();

        for(ETF__c etf: [SELECT Id, Name, Ticker_Symbol__c, Stock_Exchange__c, Market__c, Allocation__c FROM ETF__c]) {
            etfToIdMap.put(etf.Name, etf.Id);
        }

        for(Investment__c invRec : [SELECT Id, Name, Name__c, ETF__c FROM Investment__c WHERE RecordType.DeveloperName = 'ETF_Investment']) {
            Investment__c inv = new Investment__c(Id = invRec.Id);
            String etfName = invRec.Name__c;
            String etf = String.isNotBlank(etfName) ? etfName.substring(0, etfName.indexof('(')-1).trim() : null;	
            
            if(String.isNotBlank(etf)) {
                inv.ETF__c = etfToIdMap.get(etf);
                invRecsToUpdate.add(inv);
            }
        }

        if(!invRecsToUpdate.isEmpty()) {
            update invRecsToUpdate;
        }
    }
}