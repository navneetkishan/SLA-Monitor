import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import {formatDate} from '@angular/common';
import { DOCUMENT } from '@angular/common';
import 'rxjs/add/operator/catch';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']  
})
export class AppComponent implements OnInit {
    title = 'SLA-Monitor-LEVEL3';
    gridApi;
    defaultColDef;
    columnDefs;
    gridColumnApi;
    rowClassRules;
    rowData: any;
    sub: Subscription;
    todayOpenTicketCount =0;
    totalOpenTicketCount =0;
    todayUnassignedTicketCount =0;  
    currDateMT = "";
    selectedDept = 'ALL GROUPS';
    departments = [
      'ALL GROUPS',
      'SALES',
      'SERVASSR',
      'VOICE',
      'WORKFLOW',
      'INVENTORY',
      'GEMSTARS',
      'PORTALS',
      'WORKVU',
      'ACTIVATION',
      'CUPIC',
      'CPE-E2E'
      ];
    
    serverURL = '/slamonitor/level3/getsladata';
    constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {    
      const currentUrl = this.document.location.href;
      if(currentUrl.indexOf("solution") > 0){        
        var id = currentUrl.split('/').pop();
        this.renderDeepAssistGrid(id)
      }
      else{
        this.columnDefs = [
          {
            headerName: "ID",
            field: "id"
          },
          {
            headerName: "Time Left",
            field: "business_time_left",
            headerTooltip: "Time Left",
            comparator: businessTimeComparator,
            cellStyle: function(params) {
              var bgcolor = business_percentageColor(params.data.business_percentage);           
              var weight = 600;
              return {"font-weight": weight, "background-color": bgcolor, "font-size": "small" };
            }
          },
          {
            headerName: "% Lost",
            field: "business_percentage",
            headerTooltip: '% Lost',
            cellStyle: function(params) {
                  var bgcolor = business_percentageColor(params.value);           
                  var weight = 600;
                  return {"font-weight": weight, "background-color": bgcolor, "font-size": "small" };
                },
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: "Breached",
            field: "has_breached",
            headerTooltip: 'Breached',
            cellStyle: function(params) {
              var bgcolor = has_breachedColor(params.value);           
              return {"font-weight": 600, "background-color": bgcolor + '!important', "font-size": "small" };
            },
          },
          {
            headerName: "State",
            field: "state",
            tooltipField: "state",
            filterParams: {
              filterOptions: [
                "empty",
                {//(params.data.state == 'Pending') || (params.data.state == 'Scheduled work') || (params.data.state == 'Waiting for User') || (params.data.state == 'Waiting for Approval')
                  displayKey: "SLA Paused",
                  displayName: 'SLA Paused',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && (cellValue == 'pending' || cellValue == 'scheduled work' || cellValue == 'waiting for user' || cellValue == 'waiting for approval');
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "SLA InProgress",
                  displayName: 'SLA InProgress',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && (cellValue != 'pending' && cellValue != 'scheduled work' && cellValue != 'waiting for user' && cellValue != 'waiting for approval');
                  },
                  hideFilterInput: true
                }
              ],
            }
          },
          {
            headerName: "Assigned To",
            field: "assigned_to",
            tooltipField: "assigned_to"
          },
          {
            headerName: "Short Description",
            field: "short_description",
            tooltipField: "short_description",
          },
          {
            headerName: "Group",
            field: "group",
            tooltipField: "group",
            filterParams: {
              filterOptions: [
                "empty",
                {
                  displayKey: "SALES",
                  displayName: 'SALES',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("sales") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "INVENTORY",
                  displayName: 'INVENTORY',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("inventory") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "GEMSTARS",
                  displayName: 'GEMSTARS',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("gem") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "WORKFLOW",
                  displayName: 'WORKFLOW',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("workflow") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "SERVICE ASSURANCE",
                  displayName: 'SERVICE ASSURANCE',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("service") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "PORTALS",
                  displayName: 'PORTALS',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("portals") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "VOICE",
                  displayName: 'VOICE',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("voice") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "WORKVU",
                  displayName: 'WORKVU',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("workvu") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "ACTIVATION",
                  displayName: 'ACTIVATION',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("activations") == 5;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "CUPIC",
                  displayName: 'CUPIC',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("omnivue") > 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "CPE-E2E",
                  displayName: 'CPE-E2E',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("cpe") > 0;
                  },
                  hideFilterInput: true
                }
              ],
            }
          },
          {
            headerName: "Priority",
            field: "priority",
            filterParams: {
              filterOptions: [
                "empty",
                {
                  displayKey: "P1",
                  displayName: 'P1',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("p1") == 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "P2",
                  displayName: 'P2',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("p2") == 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "P3",
                  displayName: 'P3',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("p3") == 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "P4",
                  displayName: 'P4',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("p4") == 0;
                  },
                  hideFilterInput: true
                },
                {
                  displayKey: "P5",
                  displayName: 'P5',
                  test: function(filterValue, cellValue) {
                    return cellValue != null && cellValue.indexOf("p5") == 0;
                  },
                  hideFilterInput: true
                }
              ],
            }
          },
          {
            headerName: "Expedited",
            field: "escalation",
            headerTooltip: 'Expedited',
            cellStyle: function(params) {
              var bgcolor = has_breachedColor(params.value);           
              return {"font-weight": 600, "background-color": bgcolor + '!important', "font-size": "small" };
            },
          },
          {
            headerName: "Created Date(MT)",
            field: "created_date",
            tooltipField: "created_date",
            filter: "agDateColumnFilter",
            filterParams: {
              comparator: function(filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
                dateAsString = dateAsString.split(" ")[0];
                var dateParts = dateAsString.split("-");
                var cellDate = new Date(Number(dateParts[0]), Number(dateParts[1])-1, Number(dateParts[2]));
                if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                  return 0
                }
                if (cellDate < filterLocalDateAtMidnight) {
                  return -1;
                }
                if (cellDate > filterLocalDateAtMidnight) {
                  return 1;
                }
              },
              browserDatePicker: true
            }
          },
          {
            headerName: "Configuration Item",
            field: "cmdb_ci",
            tooltipField: "cmdb_ci"
          },
    
          {
            headerName: "Days Not Worked",
            field: "days_not_worked",
            filter: 'agNumberColumnFilter'
          },
          {
            headerName: "Suggested Soultion",
            cellRenderer: (params) => {
              const element = document.createElement('span');
              let template;
              if (params.data.group=='Global - Sales/OE - Tier 2/3' || params.data.group=='Global - Voice - Tier 2/3' || params.data.group=='Global - Workflow - Tier 2/3' || params.data.group=='Global - Inventory & Activations - Tier 2/3' || params.data.group=='Global - Portals  - Tier 2/3' || params.data.group=='Global - Service Assurance - Tier 2/3' || params.data.group=='NA - CPE E2E - Tier 3')
              {                
                template= `<a id="deepassist" title="Click Me for Help" href="/slamonitor/lvl3/solution/`+params.data.id+`" target="_blank"><span class="material-icons">
                support_agent
                </span></a>`
              }
              else
              {
                template= '';
              }
              element.innerHTML = template;
              return element;
             }, 
             filter: false,
             sortable: false
          },
          // {
          //   headerName: "Sla Due(MT)",
          //   field: "sla_due",
          //   tooltipField: "sla_due",
          //   filter: "agDateColumnFilter",
          //   filterParams: {
          //     comparator: function(filterLocalDateAtMidnight, cellValue) {
          //       var dateAsString = cellValue;
          //       dateAsString = dateAsString.split(" ")[0];
          //       var dateParts = dateAsString.split("-");
          //       var cellDate = new Date(Number(dateParts[0]), Number(dateParts[1])-1, Number(dateParts[2]));
          //       if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
          //         return 0
          //       }
          //       if (cellDate < filterLocalDateAtMidnight) {
          //         return -1;
          //       }
          //       if (cellDate > filterLocalDateAtMidnight) {
          //         return 1;
          //       }
          //     },
          //     browserDatePicker: true
          //   }
          // },
          // {
          //   headerName: "Time Left(HH:MM:SS)",
          //   field: "timeRemaining",
          //   cellStyle: function(params) {
          //     var color = hourRemaining(params.value);        
          //     var bgcolor = statusColor(params.value);           
          //     var weight = 700;
          //     if(color=='#f31313')   
          //         weight = 800;
          //     return { "color": color, "font-weight": weight, "background-color": bgcolor, "font-size": "small" };
          //   },
          //   comparator: hoursComparator
          // },
        ];
        this.defaultColDef = { 
          resizable: true,
          sortable: true,
          filter: true
        }
      
        this.rowClassRules = {
            // "pausedTickets": function(params) { 
            //   return ((params.data.state == 'Pending') || (params.data.state == 'Scheduled work') || (params.data.state == 'Waiting for User') || (params.data.state == 'Waiting for Approval'))
            // },
            "nonProgressTickets": function(params) { 
              return ((params.data.days_not_worked >= 3) && (params.data.work_started == 'N'))
            },
            "progressedTickets": function(params) { 
              return ((params.data.days_not_worked >= 3) && (params.data.work_started == 'Y'))
            },
        };      

        this.http.get(this.serverURL).subscribe((res)=>{

          this.rowData = res['result'];
        });
      }
    }
    //dynamic client-side countdown 
    // updateRemainingTime() {
    //   var rowCount = this.gridApi.getDisplayedRowCount();
    //   for (var i = 0; i < rowCount; i++) {
    //     var rowNode = this.gridApi.getDisplayedRowAtIndex(i);
    //     var col = ["timeRemaining"];
    //     var seconds = hoursToComparableNumber(rowNode.data['timeRemaining']);
    //     var updatedTime = Number(seconds)-1;
    //     if(seconds!=undefined){
    //       if(seconds>0){
    //         rowNode.setDataValue(col, secondsTohhmmss(updatedTime));
    //       }else{
    //         rowNode.setDataValue(col, "-"+secondsTohhmmss(updatedTime*-1));
    //       }
    //     }
    //   }
    // }

    ngOnInit() {
        
    }

    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;      
      const currentUrl = this.document.location.href;
      if(currentUrl.indexOf("solution") > 0){        
        var id = currentUrl.split('/').pop();
        document.getElementById('nonprogresstickets_li').style.display = 'none';
        document.getElementById('progressedtickets_li').innerHTML = '<label id="solutionLabel">Suggested Soultion for the Ticket: <b>'+id+'</b></label>';
        document.getElementById('progressedtickets_li').style.margin = '0 -13% 0 25%';
        document.getElementById('breach_legend').style.display = 'none';
      }
    }
    private data = [];

    onFirstDataRendered(params) {
      params.api.sizeColumnsToFit();
      this.gridApi.forEachNode(node => this.data.push(node.data));	
      const currentUrl = this.document.location.href;
      if(currentUrl.indexOf("solution") < 0){        
        this.calculateDailyMetrics(this.data);
      }
      // this.sub = interval(1000).subscribe((val) => { this.updateRemainingTime(); }); //update time every second
    }
    calculateDailyMetrics(data) {
      this.totalOpenTicketCount=0;
      this.todayOpenTicketCount=0;
      this.todayUnassignedTicketCount=0;
      
      var currDate = formatDate(new Date().toLocaleString("en-US", {timeZone: "America/Denver"}), 'yyyy-MM-dd', 'en');
      this.currDateMT = currDate;
      data.forEach(element => {  
        this.totalOpenTicketCount++;
        if(element['created_date'].split(" ")[0]==currDate){
            this.todayOpenTicketCount++;
            if(element['state']!='Assigned')
                this.todayUnassignedTicketCount++;
          }
      });
    }
    renderDeepAssistGrid(id){
      //add deepassit response to aggrid 
      this.columnDefs = [
        {
          headerName: "ID",
          field: "id"
        },
        {
          headerName: "Short Description",
          field: "short_description",
          tooltipField: "short_description"
        },
        {
          headerName: "Description",
          field: "desc",
          tooltipField: "desc"
        },
        {
          headerName: "Created Date",
          field: "sys_created_on",
          filter: "agDateColumnFilter",
          tooltipField: "sys_created_on",
          filterParams: {
            comparator: function(filterLocalDateAtMidnight, cellValue) {
              var dateAsString = cellValue;
              dateAsString = dateAsString.split(" ")[0];
              var dateParts = dateAsString.split("-");
              var cellDate = new Date(Number(dateParts[0]), Number(dateParts[1])-1, Number(dateParts[2]));
              if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                return 0
              }
              if (cellDate < filterLocalDateAtMidnight) {
                return -1;
              }
              if (cellDate > filterLocalDateAtMidnight) {
                return 1;
              }
            },
            browserDatePicker: true
          }
        },
        {
          headerName: "Work Notes",
          field: "work_notes",
          tooltipField: "work_notes"
        },
        {
          headerName: "Similarity Score",
          field: "similarity",
          filter: 'agNumberColumnFilter'
        }
      ];
      this.defaultColDef = { 
        resizable: true,
        sortable: true,
        filter: true
      }
      this.http.get("http://deepassist-dev.kubeodc-test.corp.intranet/deep_assist/similar_tickets_id/json/"+id).subscribe((res : any[])=>{
          this.gridApi.setRowData([]);  
          this.gridApi.setRowData(res);
          this.gridApi.sizeColumnsToFit();
        },
        err =>{
          this.gridApi.setRowData([]);
          this.gridApi.sizeColumnsToFit();
        } 
        );
        
    }
    onBtnExport(): void {
      const params = {
        columnGroups: true,
        allColumns: true,
        fileName: 'data',
        columnSeparator: document.querySelector("#columnSeparator")
      };
      this.gridApi.exportDataAsCsv(params);
    }
    externalFilterChanged(newValue) {
      selectedGroup = newValue;
      this.gridApi.onFilterChanged();
      
      var data = [];
      data = this.gridApi.getModel().rowsToDisplay;

      this.totalOpenTicketCount=0;
      this.todayOpenTicketCount=0;
      this.todayUnassignedTicketCount=0;
      
    var currDate = formatDate(new Date().toLocaleString("en-US", {timeZone: "America/Denver"}), 'yyyy-MM-dd', 'en');
    this.currDateMT = currDate;
    data.forEach(element => {  
      this.totalOpenTicketCount++;
      if(element['data']['created_date'].split(" ")[0]==currDate){
          this.todayOpenTicketCount++;
          if(element['data']['state']!='Assigned')
              this.todayUnassignedTicketCount++;
        }
    });
      
    }

    isExternalFilterPresent() {
      return selectedGroup != 'All Groups';
    }
  
    doesExternalFilterPass(node) {
      switch (selectedGroup) {
        case 'WORKFLOW':
          return node.data.group == 'Global - Workflow - Tier 2/3';
        case 'SALES':
          return node.data.group == 'Global - Sales/OE - Tier 2/3';
        case 'INVENTORY':
          return node.data.group == 'Global - Inventory & Activations - Tier 2/3';
        case 'GEMSTARS':
          return node.data.group == 'Global - GEM/STARS & ChuckNorris - Tier 2/3';
        case 'SERVASSR':
          return node.data.group == 'Global - Service Assurance - Tier 2/3';
        case 'VOICE':
          return node.data.group == 'Global - Voice - Tier 2/3';
        case 'PORTALS':
          return node.data.group == 'Global - Portals  - Tier 2/3';        
        case 'WORKVU':
          return node.data.group == 'NA - WorkVu - Tier 2/3  ';
        case 'ACTIVATION':
          return node.data.group == 'NA - Activations - Tier 2/3  ';            
        case 'CUPIC':
          return node.data.group == 'NA - OmniVue Ethernet - Tier 2/3  ';
        case 'CPE-E2E':
          return node.data.group == 'NA - CPE E2E - Tier 3';
        default:
          return true;

      }
    }

    onDeptChange(dept){
      this.selectedDept = dept;
      const currentUrl = this.document.location.href;
      if(currentUrl.indexOf("solution") < 0){
        this.externalFilterChanged(dept.target.value);
      }
    }

}

var selectedGroup = 'All Groups';
//helper methods
// function statusColor(val) {
//   val = hoursToComparableNumber(val)
//   if (val<0){
//     return "#f31313";
//   } 
// }
function business_percentageColor(val){
  if(val<=80)
    return '#08bf3d';
  else if(val>80 && val<100)
    return '#FFBF00';
  else 
    return '#f31313';
}
function has_breachedColor(val){
  return val == 'Y' ? '#f31313' : '#08bf3d';
}

// function hourRemaining(val) {  
//   val = hoursToComparableNumber(val)
//   if ((val <= (3*3600) && (val >= 0))) {
//     return "#f31313";
//   }else if(val<0){
//     return "black";
//   }else{
//     return "#0a731b";
//   }  
// }
// function hoursComparator(hour1, hour2){
//   var date1Number = hoursToComparableNumber(hour1);
//   var date2Number = hoursToComparableNumber(hour2);
//   if (date1Number === null && date2Number === null) {
//     return 0;
//   }
//   if (date1Number === null) {
//     return -1;
//   }
//   if (date2Number === null) {
//     return 1;
//   }
//   return date1Number - date2Number;
// }
// function hoursToComparableNumber(hour){
//   if(hour!=undefined){
//     var digits = hour.split(":");
//     var temp = (digits[0]).split("-");
//     if(temp.length>1){
//       return (((Number(digits[0]) * 3600) * -1) + (Number(digits[1]) * 60) + (Number(digits[2])))*-1;
//     }else{
//       return ((Number(digits[0]) * 3600) + (Number(digits[1]) * 60) + (Number(digits[2])));
//     }
//   }
//   return 0;
// }
// function secondsTohhmmss(totalSeconds) {
//   var hours   = Math.floor(totalSeconds / 3600);
//   var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
//   var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

//   seconds = Math.round(seconds * 100) / 100

//   var result = (hours < 10 ? "0" + hours : hours);
//       result += ":" + (minutes < 10 ? "0" + minutes : minutes);
//       result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
//   return result;
// }
function businessTimeComparator(time1, time2){
  var date1Number = businessTimeToComparableNumber(time1);
  var date2Number = businessTimeToComparableNumber(time2);
  if (date1Number === null && date2Number === null) {
    return 0;
  }
  if (date1Number === null) {
    return -1;
  }
  if (date2Number === null) {
    return 1;
  }
  return date1Number - date2Number;
}

function businessTimeToComparableNumber(businessTime){
  
  var tot_seconds = 0;
  var Day = Number(businessTime.split("Day")[0].slice(-3)) *60*60*24;
  var hour = Number(businessTime.split("Hour")[0].slice(-3)) *60*60;
  var minutes = Number(businessTime.split("Minute")[0].slice(-3)) *60;
  var seconds = Number(businessTime.split("Second")[0].slice(-3));

  tot_seconds += isNaN(Day)? 0 : Day;
  tot_seconds += isNaN(hour)? 0 : hour;
  tot_seconds += isNaN(minutes)? 0 : minutes;
  tot_seconds += isNaN(seconds)? 0 : seconds;
  return tot_seconds;
}
