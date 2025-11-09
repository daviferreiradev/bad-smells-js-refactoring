const PRIORITY_THRESHOLD = 1000;
const USER_VALUE_LIMIT = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const filteredItems = this.filterItemsByUserRole(user, items);
    const total = this.calculateTotal(filteredItems);

    const formatter = this.getFormatter(reportType);
    return formatter.format(user, filteredItems, total);
  }

  filterItemsByUserRole(user, items) {
    const filteredItems = [];

    for (const item of items) {
      if (this.shouldIncludeItem(user, item)) {
        const processedItem = { ...item };

        if (user.role === 'ADMIN' && item.value > PRIORITY_THRESHOLD) {
          processedItem.priority = true;
        }

        filteredItems.push(processedItem);
      }
    }

    return filteredItems;
  }

  shouldIncludeItem(user, item) {
    if (user.role === 'ADMIN') {
      return true;
    }

    return user.role === 'USER' && item.value <= USER_VALUE_LIMIT;
  }

  calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  getFormatter(reportType) {
    const formatters = {
      'CSV': new CSVFormatter(),
      'HTML': new HTMLFormatter()
    };

    return formatters[reportType] || formatters['CSV'];
  }
}

const NOT_IMPLEMENTED_ERROR = 'Method must be implemented';

class ReportFormatter {
  format(user, items, total) {
    let report = this.generateHeader(user);
    report += this.generateBody(user, items);
    report += this.generateFooter(total);
    return report.trim();
  }

  generateHeader() {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  }

  generateBody() {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  }

  generateFooter() {
    throw new Error(NOT_IMPLEMENTED_ERROR);
  }
}

class CSVFormatter extends ReportFormatter {
  generateHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  generateBody(user, items) {
    return items
      .map(item => `${item.id},${item.name},${item.value},${user.name}`)
      .join('\n') + (items.length > 0 ? '\n' : '');
  }

  generateFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HTMLFormatter extends ReportFormatter {
  generateHeader(user) {
    let header = '<html><body>\n';
    header += '<h1>Relatório</h1>\n';
    header += `<h2>Usuário: ${user.name}</h2>\n`;
    header += '<table>\n';
    header += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
    return header;
  }

  generateBody(user, items) {
    return items
      .map(item => this.generateItemRow(item))
      .join('');
  }

  generateItemRow(item) {
    if (item.priority) {
      return `<tr style="font-weight:bold;"><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  generateFooter(total) {
    let footer = '</table>\n';
    footer += `<h3>Total: ${total}</h3>\n`;
    footer += '</body></html>\n';
    return footer;
  }
}
