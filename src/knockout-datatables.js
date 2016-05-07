import $ from 'jquery';
import ko from 'knockout';
import 'datatables.net';
import 'datatables.net-fixedColumns';

const defaultOptions = {
    deferRender: true,
    paging: true
};

ko.bindingHandlers.datatables = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        const $element = $(element),
            binding = ko.unwrap(valueAccessor()),
            options = binding.options || {};

        $.extend(true, options, defaultOptions);

        if (binding.rowTemplateId && binding.data) {

            // bind the header first
            ko.applyBindingsToDescendants(viewModel, $element.find('thead')[0]);

            setupTableBody($element, binding, bindingContext);

            if (ko.isObservable(binding.data)) {

                // destroy and build the table again when the data changes
                binding.data.subscribe(() => {
                    $element.DataTable().destroy();
                    $element.find('tbody').remove();

                    setupTableBody($element, binding, bindingContext);
                    initializeDataTable(element, options);
                }, null, 'arrayChange');
            }
        }

        initializeDataTable(element, options);

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            $(element).DataTable().destroy();
        });

        return {
            controlsDescendantBindings: true
        };
    }
};

function initializeDataTable(element, options) {
    const table = $(element).DataTable(options);
    
    if (options.fixedColumns) {

        // we need to apply the context to the cloned table for the first time
        setTimeout(() => {
            applyBindingsToClonedRows(element, options.fixedColumns);
        }, 0);

        // register handler to fix the cloned table column width
        // when the table is (re)drawn
        table.on('draw.dt', (event) => {
            $(event.target).DataTable().fixedColumns().relayout();
        });

        // register handler to fix the cloned table binding context
        // when the table is (re)drawn
        table.on('draw.dt.DTFC', (event) => {
            applyBindingsToClonedRows(event.target, options.fixedColumns);
        });
    }
}

function setupTableBody($element, binding, bindingContext) {

    // render each element of the body with the template
    let tbody = $element.find('tbody')[0];
    if (!tbody) {
        tbody = document.createElement('tbody');
        $element.append(tbody);
    }
    ko.renderTemplateForEach(ko.unwrap(binding.rowTemplateId), binding.data, {}, tbody, bindingContext);
}

function applyBindingsToClonedRows(originalTable, fixedColumnsOptions) {
    const $table = $(originalTable);
    const rows = $table.find('tbody>tr');

    if (fixedColumnsOptions.leftColumns) {
        const clonedRows = $table.parent().parent().parent().find('.DTFC_LeftBodyWrapper .DTFC_Cloned').find('tbody>tr');
        for (let i = 0; i < rows.length; i++) {
            ko.applyBindings(ko.contextFor(rows[i]), clonedRows[i]);
        }
    }

    if (fixedColumnsOptions.rightColumns) {
        const clonedRows = $table.parent().parent().parent().find('.DTFC_RightBodyWrapper .DTFC_Cloned').find('tbody>tr');
        for (let i = 0; i < rows.length; i++) {
            ko.applyBindings(ko.contextFor(rows[i]), clonedRows[i]);
        }
    }
}
