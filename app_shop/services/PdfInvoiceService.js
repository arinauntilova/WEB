const IDocInvoiceService = require("../services/IDocInvoiceService");

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

class PdfInvoiceService extends IDocInvoiceService {
    constructor() {
        super();
        this.fontSize_main = 26;
        this.fontSize_products = 14;
        this.fontSize_price = 20;
    }
    createInvoice(order) {
        console.log("создать чек в формате pdf");
        const invoiceName = "invoice-" + order._Id + ".pdf";
        const invoicePath = path.join("data", "invoices", invoiceName);
  
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
  
        pdfDoc.fontSize(this.fontSize_main).text("Invoice", {
          align: "center",
        });
        pdfDoc.text("--------------------", {
          align: "center",
        });
  
        let totalPrice = 0;
        order.products.forEach((prod) => {
          totalPrice += prod.quantity * prod.productData.price;
          pdfDoc
            .fontSize(this.fontSize_products)
            .text(prod.productData.title + " - " + prod.quantity + " x $" + prod.productData.price);
        });
        pdfDoc.fontSize(this.fontSize_main).text("--------------------", {
          align: "center",
        });
        pdfDoc.fontSize(this.fontSize_price).text("Total price: $" + totalPrice, {
          align: "center",
        });
  
        pdfDoc.end();
        return pdfDoc;
    }
}

module.exports = PdfInvoiceService;