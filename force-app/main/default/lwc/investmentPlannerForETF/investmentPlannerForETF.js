import { LightningElement, wire, track } from 'lwc';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import getETFs from '@salesforce/apex/InvestmentPlannerController.getETFs';
import ETF_OBJECT from '@salesforce/schema/ETF__c';
import MARKET_FIELD from '@salesforce/schema/ETF__c.Market__c';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Ticker Symbol', fieldName: 'TickerSymbol' },
    { label: 'Market', fieldName: 'Market' },
    { 
        label: 'Allocation (%)', 
        fieldName: 'AllocationPercentage', 
        type: 'percent',
        cellAttributes: { alignment: 'left' } 
    },
    { 
        label: 'Allocated Amount', 
        fieldName: 'AllocatedAmount', 
        type: 'currency',
        cellAttributes: { alignment: 'left' } 
    }
];

export default class InvestmentPlannerForETF extends LightningElement {
    objectInfo;
    investmentAmount;
    columns = COLUMNS;
    selectedMarket = null;
    marketOptions = { label: "--None--", value: null };
    @track ETFs = [];
    showETFsData = false;
    delayTimeout = null;

    handleInvestmentAmountChange(event) {
        // Clear previous timer if user is still typing
        window.clearTimeout(this.delayTimeout);
        const inputValue = event.target.value;

        // Delay the execution of processing ETFs untill user stops typing for 500ms
        this.delayTimeout = setTimeout(() => {
            this.investmentAmount = inputValue > 0 ? inputValue : null;
            this.processETFs();
        }, 500);
    }

    handleMarketChange(event) {
        this.selectedMarket = event.target.value;
        this.processETFs();
    }

    @wire(getObjectInfo, { 
        objectApiName: ETF_OBJECT 
    })
    wiredObjectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$wiredObjectInfo.data.defaultRecordTypeId',
        fieldApiName: MARKET_FIELD
    })
    wiredMarketPicklistValues(result) {
        if(result.data) {
            const marketValues = result.data.values.map(option => ({
                label: option.label,
                value: option.value
            }));

            // Prepend the default option to the market options
            this.marketOptions = [this.marketOptions, ...marketValues];
        } else if(result.error) {
            console.error('Error loading market picklist values:', JSON.stringify(result.error));
        }
    }

    processETFs() {
        if(this.investmentAmount != null && this.selectedMarket != null) {
            this.loadETFsData();
            this.showETFsData = true;
        } else {
            this.ETFs = [];
            this.showETFsData = false;
        }
    }

    async loadETFsData() {
        try {
            const results = await getETFs();

            // Map the results to include the calculated Allocation Percentage and Allocated Amount
            let loadedETFs = results.map(etf => ({
                Id: etf.Id,
                Name: etf.Name,
                TickerSymbol: etf.Ticker_Symbol__c,
                Market: etf.Market__c,
                AllocationPercentage: etf.Allocation__c / 100,
                AllocatedAmount: (etf.Allocation__c / 100) * this.investmentAmount
            }));

            // Filter ETFs based on the selected Market
            this.ETFs = loadedETFs.filter(etf => etf.Market === this.selectedMarket);
        } catch (error) {
            console.error('Error loading ETFs data:', JSON.stringify(error));
        }
    }
}