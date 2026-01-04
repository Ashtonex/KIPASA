// src/types/paynow.d.ts
declare module 'paynow' {
    export class Paynow {
        constructor(integrationId: string, integrationKey: string, resultUrl: string, returnUrl: string);
        createPayment(reference: string, authEmail: string): any;
        send(payment: any): Promise<any>;
        sendMobile(payment: any, phone: string, method: string): Promise<any>;
        pollTransaction(url: string): Promise<any>;
        parseNotify(data: any): any;
    }
}