import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { AuthContext } from './AuthContext';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { apiBaseUrl, currentYear } from './Constants';
import { Calendar } from 'primereact/calendar';
import { Growl } from 'primereact/growl';
import { getYear, toDate, toMySQLDate } from './Date';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Inplace, InplaceContent, InplaceDisplay } from 'primereact/components/inplace/Inplace';
import { Spinner } from 'primereact/spinner';

class AnnualLeaves extends Component {
    constructor(props) {
        super(props);
        this.totalLeavesRef = React.createRef();

        this.state = {
            leaves: [],
            leave: null,
            year: currentYear,
        };
    }

    signOut = e => {
        e.preventDefault();

        localStorage.removeItem('token');
        this.context.logout();
    };

    addNewLeave = () => {
        if (this.state.leave.from && this.state.leave.until) {
            const formData = new FormData();
            formData.append('from', this.state.leave.from);
            formData.append('until', this.state.leave.until);

            fetch(apiBaseUrl + 'leaves', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.status === 201) {
                    this.fetchAllLeaves();

                    this.setState({ selectedLeave: null, leave: null, displayDialog: false });

                    this.growl.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'New leave added successfully',
                    });
                } else {
                    this.growl.show({
                        severity: 'error',
                        summary: 'Problem in Server',
                        detail: `Server respond with $\{response.status}`,
                    });
                }
            });
        } else {
            this.growl.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'From and Until fields can not be empty',
            });
        }
    };

    fetchAllLeaves = () => {
        fetch(apiBaseUrl + 'leaves', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token'),
                Accept: 'application/json',
            },
        })
            .then(response => response.json())
            .then(result => {
                let years = this.calculateAllYears(result.data);
                this.setState({
                    leaves: result.data,
                    years: years,
                });
                this.updateProgressBar();
            });
    };

    calculateAllYears = data => {
        let years = [];

        for (let value of data) {
            let year = getYear(value.from);
            if (years.indexOf(year) === -1) {
                years.push(year);
            }

            year = getYear(value.until);
            if (years.indexOf(year) === -1) {
                years.push(year);
            }
        }
        if (years.indexOf(currentYear) === -1) {
            years.unshift(currentYear);
        }

        let dropdownValues = [{ label: 'All', value: '' }];
        for (let year of years) {
            dropdownValues.push({ label: year, value: year });
        }
        return dropdownValues;
    };

    updateProgressBar = () => {
        let currentYearLeaves = 0;

        for (let value of this.state.leaves) {
            if (getYear(value.from) === this.state.year) {
                currentYearLeaves += parseInt(value.days);
            }
        }

        let percentage = Math.floor(((this.state.totalLeaves - currentYearLeaves) / this.state.totalLeaves) * 100);
        let remaining = this.state.totalLeaves - currentYearLeaves;

        this.setState({ progress: percentage, remaining: remaining });
    };

    updateLeave = () => {
        if (this.state.leave.from && this.state.leave.until) {
            const formData = new FormData();
            formData.append('from', this.state.leave.from);
            formData.append('until', this.state.leave.until);
            formData.append('_method', 'PUT');

            fetch(apiBaseUrl + 'leaves/' + this.state.leave.id, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.status === 200) {
                    this.fetchAllLeaves();

                    this.setState({ selectedLeave: null, leave: null, displayDialog: false });

                    this.growl.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Leave updated successfully',
                    });
                } else {
                    this.growl.show({
                        severity: 'error',
                        summary: 'Problem in Server',
                        detail: `Server respond with $\{response.status}`,
                    });
                }
            });
        } else {
            this.growl.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'From and Until fields can not be empty',
            });
        }
    };

    save = () => {
        if (this.newLeave) this.addNewLeave();
        else this.updateLeave();
    };

    delete = () => {
        if (this.state.leave.id) {
            fetch(apiBaseUrl + 'leaves/' + this.state.leave.id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                    Accept: 'application/json',
                },
            }).then(response => {
                if (response.status === 204) {
                    let index = this.findSelectedLeaveIndex();
                    this.setState(
                        {
                            leaves: this.state.leaves.filter((val, i) => i !== index),
                            selectedLeave: null,
                            leave: null,
                            displayDialog: false,
                        },
                        () => {
                            this.updateProgressBar();
                        },
                    );

                    this.growl.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Leave deleted successfully',
                    });
                } else {
                    this.growl.show({
                        severity: 'error',
                        summary: 'Problem in Server',
                        detail: `Server respond with $\{response.status}`,
                    });
                }
            });
        } else {
            this.growl.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'ID of leave not exist',
            });
        }
    };

    updateTotalLeaves = () => {
        this.totalLeavesRef.current.close();

        const formData = new FormData();
        formData.append('total_leaves', this.state.totalLeaves);
        formData.append('_method', 'PUT');

        fetch(apiBaseUrl + 'user/' + this.context.user.id, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token'),
                Accept: 'application/json',
            },
        }).then(response => {
            if (response.status === 200) {
                this.updateProgressBar();

                this.growl.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Total leaves updated successfully',
                });
            } else {
                this.growl.show({
                    severity: 'error',
                    summary: 'Problem in Server',
                    detail: `Server respond with $\{response.status}`,
                });
            }
        });
    };

    findSelectedLeaveIndex() {
        return this.state.leaves.indexOf(this.state.selectedLeave);
    }

    updateProperty = (property, value) => {
        let leave = this.state.leave;
        leave[property] = value;
        this.setState({ leave: leave });
    };

    onLeaveSelect = e => {
        this.newLeave = false;
        this.setState({
            displayDialog: true,
            leave: Object.assign({}, e.data),
        });
    };

    addNew = () => {
        this.newLeave = true;
        this.setState({
            leave: { id: '', from: '', until: '', days: '' },
            displayDialog: true,
        });
    };

    componentDidMount() {
        this.setState({ totalLeaves: this.context.user.total_leaves });
        this.fetchAllLeaves();
    }

    render() {
        const logout = (
            <Button label='Logout' icon='pi pi-power-off' style={{ marginLeft: 4 }} onClick={this.signOut} />
        );

        const header = (
            <div style={{ textAlign: 'left' }}>
                <Dropdown
                    value={this.state.year}
                    options={this.state.years}
                    onChange={e => {
                        this.setState({ year: e.value }, () => {
                            this.updateProgressBar();
                        });
                    }}
                    placeholder='Select a Year'
                />
            </div>
        );

        const footer = (
            <div className='p-clearfix' style={{ width: '100%' }}>
                <Button
                    style={{ float: 'left' }}
                    className='p-button-success'
                    label='Add'
                    icon='pi pi-plus'
                    onClick={this.addNew}
                />
            </div>
        );

        const dialogFooter = (
            <div className='ui-dialog-buttonpane p-clearfix'>
                <Button label='Delete' icon='pi pi-times' onClick={this.delete} />
                <Button label='Save' icon='pi pi-check' onClick={this.save} />
            </div>
        );

        return (
            <div className='content-section'>
                <Growl ref={el => (this.growl = el)} />
                <div className='p-grid p-justify-center'>
                    <div className='p-col-12 header'>
                        <h1>Annual Leaves App</h1>
                    </div>
                    <div className='p-col-fixed'>
                        <AuthContext.Consumer>
                            {({ user }) => (
                                <Card title='User Info' subTitle={user.name} footer={logout}>
                                    <h3>Total Annual Leaves</h3>
                                    <Inplace ref={this.totalLeavesRef}>
                                        <InplaceDisplay>
                                            <strong>{this.state.totalLeaves}</strong>
                                        </InplaceDisplay>
                                        <InplaceContent>
                                            <div className='p-grid'>
                                                <div className='p-col'>
                                                    <Spinner
                                                        value={this.state.totalLeaves}
                                                        onChange={e => this.setState({ totalLeaves: e.value })}
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className='p-col'>
                                                    <Button icon='pi pi-check' onClick={this.updateTotalLeaves} />
                                                </div>
                                            </div>
                                        </InplaceContent>
                                    </Inplace>
                                    <br />
                                    <h3>Remaining Annual Leaves</h3>
                                    <h4>{this.state.remaining}</h4>
                                    <ProgressBar value={this.state.progress} />
                                </Card>
                            )}
                        </AuthContext.Consumer>
                    </div>
                    <div className='p-col'>
                        <DataTable
                            value={this.state.leaves}
                            header={header}
                            footer={footer}
                            globalFilter={this.state.year}
                            selectionMode='single'
                            selection={this.state.selectedLeave}
                            onSelectionChange={e => this.setState({ selectedLeave: e.value })}
                            onRowSelect={this.onLeaveSelect}
                        >
                            <Column field='id' header='ID' sortable={true} />
                            <Column field='from' header='From' sortable={true} />
                            <Column field='until' header='Until' sortable={true} />
                            <Column field='days' header='Days' sortable={true} />
                        </DataTable>
                    </div>
                </div>

                <Dialog
                    visible={this.state.displayDialog}
                    width='300px'
                    header='Leave Details'
                    modal={true}
                    footer={dialogFooter}
                    onHide={() => this.setState({ displayDialog: false })}
                >
                    {this.state.leave && (
                        <div className='p-grid p-fluid'>
                            <div className='p-col-4' style={{ padding: '.75em' }}>
                                <label htmlFor='from'>From</label>
                            </div>
                            <div className='p-col-8' style={{ padding: '.5em' }}>
                                <Calendar
                                    maxDate={toDate(this.state.leave.until)}
                                    readOnlyInput={true}
                                    value={toDate(this.state.leave.from)}
                                    onChange={e => this.updateProperty('from', toMySQLDate(e.value))}
                                    dateFormat='dd-mm-yy'
                                />
                            </div>

                            <div className='p-col-4' style={{ padding: '.75em' }}>
                                <label htmlFor='until'>Until</label>
                            </div>
                            <div className='p-col-8' style={{ padding: '.5em' }}>
                                <Calendar
                                    minDate={toDate(this.state.leave.from)}
                                    readOnlyInput={true}
                                    value={toDate(this.state.leave.until)}
                                    onChange={e => this.updateProperty('until', toMySQLDate(e.value))}
                                    dateFormat='dd-mm-yy'
                                />
                            </div>
                        </div>
                    )}
                </Dialog>
            </div>
        );
    }
}

AnnualLeaves.contextType = AuthContext;
export default AnnualLeaves;
