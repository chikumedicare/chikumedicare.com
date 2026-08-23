import type {Employee,User,Role} from './types';
export const roles:Role[]=['MR','ASM','RSM','ZSM','NSM','VP','OWNER','ADMIN'];
export const employees:Employee[]=[
{id:'e1',empCode:'EMP001',firstName:'Ravi',lastName:'Sharma',mobile:'9876543210',email:'ravi@chiku.example',designation:'Medical Representative',department:'Sales',status:'ACTIVE',joiningDate:'10-06-2024',gender:'MALE',zoneId:'z1',stateId:'s1',hqId:'h1',areaId:'a1'},
{id:'e2',empCode:'EMP002',firstName:'Neha',lastName:'Verma',mobile:'9876543211',email:'neha@chiku.example',designation:'Area Sales Manager',department:'Sales',status:'ACTIVE',joiningDate:'15-02-2023',gender:'FEMALE',zoneId:'z1',stateId:'s1',hqId:'h2'},
{id:'e3',empCode:'EMP003',firstName:'Amit',lastName:'Patel',mobile:'9876543212',email:'amit@chiku.example',designation:'Medical Representative',department:'Sales',status:'SUSPENDED',joiningDate:'06-01-2025',gender:'MALE',zoneId:'z1',stateId:'s2',hqId:'h3',areaId:'a3'}];
export const users:User[]=[
{id:'u1',userId:'EMP001',empCode:'EMP001',fullName:'Ravi Sharma',role:'MR',isActive:true,mobile:'9876543210',email:'ravi@chiku.example',designation:'Medical Representative',hqId:'h1',reportsToId:'u2',zoneId:'z1',stateId:'s1',coveringHqIds:['h1'],areaIds:['a1']},
{id:'u2',userId:'EMP002',empCode:'EMP002',fullName:'Neha Verma',role:'ASM',isActive:true,mobile:'9876543211',email:'neha@chiku.example',designation:'Area Sales Manager',hqId:'h2',reportsToId:'u4',zoneId:'z1',stateId:'s1',coveringHqIds:['h1','h2'],areaIds:[]},
{id:'u3',userId:'EMP003',empCode:'EMP003',fullName:'Amit Patel',role:'MR',isActive:false,mobile:'9876543212',email:'amit@chiku.example',designation:'Medical Representative',hqId:'h3',reportsToId:'u2',zoneId:'z1',stateId:'s2',coveringHqIds:['h3'],areaIds:['a3']},
{id:'u4',userId:'admin',empCode:'ADM001',fullName:'System Admin',role:'ADMIN',isActive:true,mobile:'',email:'admin@chiku.example',designation:'Administrator',coveringHqIds:[],areaIds:[]}];
export const zones=[{id:'z1',code:'ZN01',name:'Central',isActive:true},{id:'z2',code:'ZN02',name:'West',isActive:true}];
export const states=[{id:'s1',code:'MP',name:'Madhya Pradesh',zoneId:'z1',isActive:true},{id:'s2',code:'CG',name:'Chhattisgarh',zoneId:'z1',isActive:true},{id:'s3',code:'RJ',name:'Rajasthan',zoneId:'z2',isActive:true}];
export const hqs=[{id:'h1',code:'BPL',name:'Bhopal',stateId:'s1',zoneId:'z1',isActive:true},{id:'h2',code:'IND',name:'Indore',stateId:'s1',zoneId:'z1',isActive:true},{id:'h3',code:'RPR',name:'Raipur',stateId:'s2',zoneId:'z1',isActive:true}];
export const areas=[{id:'a1',code:'BPL01',name:'Bhopal North',hqId:'h1',stateId:'s1',zoneId:'z1',isActive:true},{id:'a2',code:'BPL02',name:'Bhopal South',hqId:'h1',stateId:'s1',zoneId:'z1',isActive:true},{id:'a3',code:'RPR01',name:'Raipur Central',hqId:'h3',stateId:'s2',zoneId:'z1',isActive:true}];
export const beats=[{id:'b1',code:'BT001',name:'MP Nagar',areaId:'a1',isActive:true},{id:'b2',code:'BT002',name:'Arera Colony',areaId:'a1',isActive:true},{id:'b3',code:'BT003',name:'Shankar Nagar',areaId:'a3',isActive:true}];
export const leaveAllocations=[{id:'l1',employeeId:'e1',year:'2026-27',cl:12,sl:6,pl:15,isActive:true},{id:'l2',employeeId:'e2',year:'2026-27',cl:12,sl:6,pl:18,isActive:true},{id:'l3',employeeId:'e3',year:'2026-27',cl:0,sl:0,pl:0,isActive:false}];
