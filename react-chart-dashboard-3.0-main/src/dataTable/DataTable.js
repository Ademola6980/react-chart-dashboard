import BootstrapTable from 'react-bootstrap-table-next';
import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import paginationFactory from 'react-bootstrap-table2-paginator';
import useContextMenu from 'react-use-context-menu'

// const defaultSorted = [{
//     dataField: 'name',
//     order: 'desc'
// }];
const DataTable = ({ notSelectedLabels, data, columns, pagination = false }) => {
    const [
        bindMenu,
        bindMenuItems,
        useContextTrigger
    ] = useContextMenu();
    const [bindTrigger] = useContextTrigger({
        disable: false, // disable the trigger
        holdToDisplay: 1000, // time in ms after which the context menu will appear when holding the touch
        posX: 0, // distance in pixel from which the context menu will appear related to the right click X coord
        posY: 0, // distance in pixel from which the context menu will appear related to the right click y coord
        // mouseButton: MOUSE_BUTTON.RIGHT, // set to 0 for triggering the context menu with the left click
        disableIfShiftIsPressed: false, // Self explanatory 😺
        collect: () => 'useContextMenu is cool!'
    });
    const handleOnClick = () => {
        alert("ON CLICK PRESSED")
    }
    return (
        <div>
            {/* <h1>useContextMenu</h1> */}
            {/* <h2 {...bindTrigger}>Right click me to see some magic happen!</h2> */}

            <div >
                <BootstrapTable

                    // bootstrap4
                    pagination={pagination ? paginationFactory({ sizePerPage: 6, sizePerPageList: [6] }) : false}
                    keyField="id"
                    data={data}
                    columns={columns}
                // defaultSorted={defaultSorted}

                />
                {/* <nav {...bindMenu}  >
                    <div style={{ backgroundColor: 'gray', padding: 20 }}>

                        <div {...bindMenuItems} onClick={() => handleOnClick()}>Test action # 1</div>
                        <div {...bindMenuItems} onClick={() => handleOnClick()}>Test action # 2</div>
                        <div {...bindMenuItems} onClick={() => handleOnClick()}>Test action # 1</div>
                    </div>
                </nav> */}
            </div>
        </div >
    )
}
export default DataTable;