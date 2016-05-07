import ko from 'knockout';
import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';
import 'src/knockout-datatables';
import jsonFile from './data.json!text';

class DatatablesViewModel {
    constructor() {
        let jsonData = JSON.parse(jsonFile);
        
        this.rows = ko.observableArray(jsonData.data);

        setTimeout(() => {
            // this.rows.push({ name: ko.observable('caarlos'), age: '35' });
        }, 2000);
    }
}

ko.applyBindings(new DatatablesViewModel());
