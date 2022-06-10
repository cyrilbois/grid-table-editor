import {MarkdownConvertor} from '../../js/data_formats/markdown-convertor';
import { GenericDataTable } from '../../js/data_formats/generic-data-table';


describe("can get values from a markdown table row", ()=>{

    test('even if malformed with no start', () => {

        let values = new MarkdownConvertor().getValuesFromMarkdownTableRow("1|2|");

        expect(values).toEqual(expect.arrayContaining([1,2].map(s => s.toString())));
        expect(values.length).toBe(2);
    });

    test('even if malformed with no end', () => {

        let values = new MarkdownConvertor().getValuesFromMarkdownTableRow("|1|2");

        expect(values).toEqual(expect.arrayContaining([1,2].map(s => s.toString())));
        expect(values.length).toBe(2);
    });

    test('even if malformed with no start or end', () => {

        let values = new MarkdownConvertor().getValuesFromMarkdownTableRow("1|2");

        expect(values).toEqual(expect.arrayContaining([1,2].map(s => s.toString())));
        expect(values.length).toBe(2);
    });

    test('surrounding spaces are ignored', () => {

        let values = new MarkdownConvertor().getValuesFromMarkdownTableRow(" |  1    |   2    |    ");

        expect(values).toEqual(expect.arrayContaining([1,2].map(s => s.toString())));
        expect(values.length).toBe(2);
    });

    test('spaces in a cell are significant', () => {

        let values = new MarkdownConvertor().getValuesFromMarkdownTableRow("|1|2 3|");

        expect(values).toEqual(expect.arrayContaining(["1","2 3"]));
        expect(values.length).toBe(2);
    });

});

describe("a valid header is a minimum of |---|---| but we also support :", ()=>{

    test('when only - it fails', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|-|-|")).toBe(false);
    });

    test('when only -- it fails', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|--|--|")).toBe(false);
    });

    test('when empty it fails', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|  |  |")).toBe(false);
    });

    test('when very empty it fails', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|||")).toBe(false);
    });

    test('when only - single column', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|--|")).toBe(false);
    });

    test('when ---  it passes', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|---|")).toBe(true);
    });

    test('when mix of valid  it passes', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|---|----|-----|------|")).toBe(true);
    });

    test('in theory there is npt a limit to length', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("|---|-----------------------------------------------------|-----|------|")).toBe(true);
    });

    test('preceding and trailing spaces are ignored', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("   | --- | ----|----- | ------|     ")).toBe(true);
    });

    test('alignment values are allowed', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("   | :---        |    :----:   |          ---: |     ")).toBe(true);
    });

    test('alignment values are validated', () => {
        expect(new MarkdownConvertor().isMarkdownTableSeparatorRowValid("   | ::---        |    :----:   |          ---: |     ")).toBe(false);
    });
});

describe("Can convert markdown tables to data suitable for a data grid",()=>{

    test('can convert a simple 2x3 table', () => {
        const basicTable =
`|heading 1|heading 2|
|-------|-------|
|row 0 cell 0|row 0 cell 1|
|row 1 cell 0|row 1 cell 1|
`    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(2);
        expect(table.getHeader(0)).toBe('heading 1');
        expect(table.getHeader(1)).toBe('heading 2');
        expect(table.getCell(0,0)).toBe('row 0 cell 0');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');
        expect(table.getCell(1,0)).toBe('row 1 cell 0');
        expect(table.getCell(1,1)).toBe('row 1 cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        //console.log(data);

        expect(data.length).toBe(3);
        expect(data[0][0]).toBe('heading 1');
        expect(data[0][1]).toBe('heading 2');
        expect(data[1][0]).toBe('row 0 cell 0');
        expect(data[1][1]).toBe('row 0 cell 1');
        expect(data[2][0]).toBe('row 1 cell 0');
        expect(data[2][1]).toBe('row 1 cell 1');

    });

    test('can handle embedded bars', () => {
        const basicTable =
`|head&#124;ing 1|heading 2|
|-------|-------|
|row 0&#124; cell 0|row 0 cell 1|
|row 1 cell 0|row 1 &#124;cell 1|
`    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(2);
        expect(table.getHeader(0)).toBe('head|ing 1');
        expect(table.getHeader(1)).toBe('heading 2');
        expect(table.getCell(0,0)).toBe('row 0| cell 0');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');
        expect(table.getCell(1,0)).toBe('row 1 cell 0');
        expect(table.getCell(1,1)).toBe('row 1 |cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        console.log(data);

        expect(data.length).toBe(3);
        expect(data[0][0]).toBe('head|ing 1');
        expect(data[0][1]).toBe('heading 2');
        expect(data[1][0]).toBe('row 0| cell 0');
        expect(data[1][1]).toBe('row 0 cell 1');
        expect(data[2][0]).toBe('row 1 cell 0');
        expect(data[2][1]).toBe('row 1 |cell 1');

    });

    test('empty table returns empty array', () => {
        const basicTable = "";

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(0);
        expect(table.getColumnCount()).toBe(0);

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        //console.log(data);

        expect(data.length).toBe(0);
    });


    test('skips empty rows at start', () => {
        const basicTable =
`


|heading 1|heading 2|
|-------|-------|
|row 0 cell 0|row 0 cell 1|
|row 1 cell 0|row 1 cell 1|
`    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(2);
        expect(table.getHeader(0)).toBe('heading 1');
        expect(table.getHeader(1)).toBe('heading 2');
        expect(table.getCell(0,0)).toBe('row 0 cell 0');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');
        expect(table.getCell(1,0)).toBe('row 1 cell 0');
        expect(table.getCell(1,1)).toBe('row 1 cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        //console.log(data);

        expect(data.length).toBe(3);
        expect(data[0][0]).toBe('heading 1');
        expect(data[0][1]).toBe('heading 2');
        expect(data[1][0]).toBe('row 0 cell 0');
        expect(data[1][1]).toBe('row 0 cell 1');
        expect(data[2][0]).toBe('row 1 cell 0');
        expect(data[2][1]).toBe('row 1 cell 1');

    });

    test('skips empty rows at end', () => {
        const basicTable =
`|heading 1|heading 2|
|-------|-------|
|row 0 cell 0|row 0 cell 1|
|row 1 cell 0|row 1 cell 1|



`    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(2);
        expect(table.getHeader(0)).toBe('heading 1');
        expect(table.getHeader(1)).toBe('heading 2');
        expect(table.getCell(0,0)).toBe('row 0 cell 0');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');
        expect(table.getCell(1,0)).toBe('row 1 cell 0');
        expect(table.getCell(1,1)).toBe('row 1 cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        //console.log(data);

        expect(data.length).toBe(3);
        expect(data[0][0]).toBe('heading 1');
        expect(data[0][1]).toBe('heading 2');
        expect(data[1][0]).toBe('row 0 cell 0');
        expect(data[1][1]).toBe('row 0 cell 1');
        expect(data[2][0]).toBe('row 1 cell 0');
        expect(data[2][1]).toBe('row 1 cell 1');

    });


    test('terminate processing if empty rows in middle', () => {
        const basicTable =
`|heading -1|heading -2|
|-------|-------|
|row 0 cell 0|row 0 cell 1|


|row 1 cell 0|row 1 cell 1|
`    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(1);
        expect(table.getHeader(0)).toBe('heading -1');
        expect(table.getHeader(1)).toBe('heading -2');
        expect(table.getCell(0,0)).toBe('row 0 cell 0');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        expect(data.length).toBe(2);
        expect(data[0][0]).toBe('heading -1');
        expect(data[0][1]).toBe('heading -2');
        expect(data[1][0]).toBe('row 0 cell 0');
        expect(data[1][1]).toBe('row 0 cell 1');
    });


    test('table should have 3 or more - 1 is not valid', () => {
        const basicTable =
`|heading -1|heading -2|
|-|-|
|row 0 cell 0|row 0 cell 1|
`    

        let table = new MarkdownConvertor({validateSeparatorLength:true}).markdownTableToDataTable(basicTable);

        expect(table.getColumnCount()).toBe(0);
        expect(table.getRowCount()).toBe(0);

        let data = new MarkdownConvertor({validateSeparatorLength:true}).markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable

        expect(data.length).toBe(0);
    });


    test('handle new line formats', () => {
        const basicTable =
"\r\n"+        
"|heading -1|heading -2|\r\n"+
"|-------|-------|\r\n"+
"|row 0 cell 0|row 0 cell 1|\r\n"+
"\r\n"+
"\r\n"+
"|row 1 cell 0|row 1 cell 1|\r\n"
    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(1);
        expect(table.getHeader(0)).toBe('heading -1');
        expect(table.getHeader(1)).toBe('heading -2');
        expect(table.getCell(0,0)).toBe('row 0 cell 0');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        expect(data.length).toBe(2);
        expect(data[0][0]).toBe('heading -1');
        expect(data[0][1]).toBe('heading -2');
        expect(data[1][0]).toBe('row 0 cell 0');
        expect(data[1][1]).toBe('row 0 cell 1');
    });

    test('handle empty column on left', () => {
        const basicTable =
`|heading 1|heading 2|
|-------|-------|
| |row 0 cell 1|
||row 1 cell 1|
`    

        let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

        expect(table.getRowCount()).toBe(2);
        expect(table.getHeader(0)).toBe('heading 1');
        expect(table.getHeader(1)).toBe('heading 2');
        expect(table.getCell(0,0)).toBe('');
        expect(table.getCell(0,1)).toBe('row 0 cell 1');
        expect(table.getCell(1,0)).toBe('');
        expect(table.getCell(1,1)).toBe('row 1 cell 1');

        let data = new MarkdownConvertor().markdownTableToDataRows(basicTable);

        //todo: convert data to a GenericDataTable here and use that in all our tests, then migrate the code to use GenericDataTable
        //console.log(data);

        expect(data.length).toBe(3);
        expect(data[0][0]).toBe('heading 1');
        expect(data[0][1]).toBe('heading 2');
        expect(data[1][0]).toBe('');
        expect(data[1][1]).toBe('row 0 cell 1');
        expect(data[2][0]).toBe('');
        expect(data[2][1]).toBe('row 1 cell 1');

    });


    describe("Can convert generic data grids to markdown tables",()=>{

        test('can convert a simple 2x3 table to markdown table', () => {
            const basicTable =
`|heading 1|heading 2|
|-----|-----|
|row 0 cell 0|row 0 cell 1|
|row 1 cell 0|row 1 cell 1|
`    
    
            let table = new MarkdownConvertor().markdownTableToDataTable(basicTable);

            let output = new MarkdownConvertor().formatAsMarkdownTable(table);

            expect(output).toBe(basicTable);
        });

        test('convert a table and escape bars', () => {
            const expected =
`|heading&#124; 1|heading 2|h3|h4|
|-----|-----|-----|-----|
|&#124;start bar|data &#124; bar|end bar&#124;|&#124;start and end bar&#124;|
`    
    
            let table = new GenericDataTable();
            table.setHeaders(["heading| 1", "heading 2", "h3", "h4"]);
            table.appendDataRow(["|start bar","data | bar", "end bar|", "|start and end bar|"])

            let output = new MarkdownConvertor().formatAsMarkdownTable(table);

            expect(output).toBe(expected);
        });

    });

});