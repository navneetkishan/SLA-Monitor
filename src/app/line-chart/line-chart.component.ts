import { Component, OnInit, Input } from '@angular/core';
import {single} from './data';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent {

  single:  any = {};
  public view: any[] = [1270, 300];
  public showXAxis = true;
  public showYAxis = true;
  public yAxisLabel = "Sum of Tickets Opened/Closed";
  public showYAxisLabel = true;
  public showXAxisLabel = true;
  public gradient = false;
  public showLegend = true;
  public showRefLines = true;
  public graphDataChart: any[];
  public closedAvg = 0;
  public openAvg = 0;
  public colorScheme = {
    domain: ['#1182af', '#da0909'] //closed, open
  };
  public referenceLines;  
  _selectedDept = 'ALL GROUPS';

  @Input()
  set selectedDept(selectedDept: string) {
    this._selectedDept = selectedDept ;
    this.getLineChartData(this._selectedDept);
  }
  get selectedDept(): string { return this._selectedDept; }

  getLineChartData(_selectedDept) {
    var dept = "";    
    if(_selectedDept=='ALL GROUPS'){
      dept = _selectedDept;
    }else{
      dept = _selectedDept.target.value;
    }

    this.http.get('/slamonitor/getclosuregraph/level3/'+dept).subscribe((res)=>{
      var closedSum=0;  
      var openSum=0;  
      this.single = res;
      (this.single[0]['series']).forEach(element => {
        closedSum += Number(element['value']);
      });      
      (this.single[1]['series']).forEach(element => {
        openSum += Number(element['value']);
      });
      this.closedAvg = Math.round(((closedSum/7)+Number.EPSILON)*100)/100;
      this.openAvg = Math.round(((openSum/7)+Number.EPSILON)*100)/100;
      
      Object.assign(this.single)
    });
  }
  constructor(private http: HttpClient) {
    this.getLineChartData(this._selectedDept);
    Object.assign(this, { single })
  }

}
