import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { KPIData } from "./useFinancialAnalytics";
import { format } from "date-fns";

export function useFinancialExports() {
  const exportChartAsPNG = useCallback(async (chartId: string, fileName: string) => {
    const element = document.getElementById(chartId);
    if (!element) {
      console.error(`Element with id ${chartId} not found`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error exporting chart as PNG:", error);
    }
  }, []);

  const exportConsolidatedPDF = useCallback(
    async (kpis: KPIData | undefined, chartIds: string[]) => {
      if (!kpis) return;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Cabeçalho com logo
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Dashboard Financeiro - BEX", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth / 2, 28, {
        align: "center",
      });

      // Resumo de KPIs
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo de Indicadores", 14, 40);

      const kpiTableData = [
        ["Receita Total", `R$ ${kpis.receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Despesa Total", `R$ ${kpis.despesaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Lucro Líquido", `R$ ${kpis.lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
        ["Margem de Lucro", `${kpis.margemLucro.toFixed(2)}%`],
        ["Inadimplência", `${kpis.inadimplencia.toFixed(2)}%`],
        ["Saldo em Caixa", `R$ ${kpis.saldoCaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ];

      autoTable(doc, {
        startY: 45,
        head: [["Indicador", "Valor"]],
        body: kpiTableData,
        theme: "grid",
        headStyles: { fillColor: [195, 240, 18], textColor: [0, 0, 0] },
      });

      // Gráficos
      let yPosition = (doc as any).lastAutoTable.finalY + 15;

      for (const chartId of chartIds) {
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 20;
        }

        const element = document.getElementById(chartId);
        if (element) {
          try {
            const canvas = await html2canvas(element, {
              backgroundColor: "#ffffff",
              scale: 1.5,
            });

            const imgData = canvas.toDataURL("image/png");
            const imgWidth = pageWidth - 28;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (yPosition + imgHeight > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }

            doc.addImage(imgData, "PNG", 14, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          } catch (error) {
            console.error(`Error capturing chart ${chartId}:`, error);
          }
        }
      }

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Página ${i} de ${totalPages} - BEX Communication © ${new Date().getFullYear()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      doc.save(`dashboard-financeiro-${format(new Date(), "yyyyMMdd-HHmmss")}.pdf`);
    },
    []
  );

  const exportDataAsXLSX = useCallback((data: any[], fileName: string, sheetName: string = "Dados") => {
    if (!data || data.length === 0) {
      console.error("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }, []);

  return {
    exportChartAsPNG,
    exportConsolidatedPDF,
    exportDataAsXLSX,
  };
}
