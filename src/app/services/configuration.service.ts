import { Injectable } from "@angular/core";
import { ConfigurationModel } from "../model/Configuration";
import { BehaviorSubject } from "rxjs";
import * as _ from 'lodash';

type PagingConfigurationModel = {
    data: ConfigurationModel[],
    totalItem: number
}

export type SortInfo = {
    sortField: keyof ConfigurationModel,
    sortDirection: 'asc' | 'desc'
}

const generateMockData = (totalItem = 100) : ConfigurationModel[] => {
    const result : ConfigurationModel[] = []
    for (let index = 0; index < totalItem; index++) {
        result.push({
            id: index + 1,
            applicationName: `Application ${index}`,
            key: `Key ${index}`,
            lastModifiedBy: '',
            lastModifiedOn: null,
            value: `Value ${index}`,
            versionNumber: `${index}`
        })
    }

    return result;
}

@Injectable({ providedIn: 'root' })
export default class ConfigurationService {
    private dataSourceSubject = new BehaviorSubject<ConfigurationModel[]>(generateMockData())
    items$ = this.dataSourceSubject.asObservable();
    constructor() {
    }

    getPagingConfiguration(pageSize: number, pageIndex: number, key: string, applicationName: string, sortInfo?: SortInfo): PagingConfigurationModel {
        const sortApply : SortInfo = sortInfo ? sortInfo : { sortDirection: 'desc', sortField: 'id' };
        const data = _.orderBy(this.dataSourceSubject.value.filter(model => {
            let isMatch = true
            if (key) isMatch = model.key.toLowerCase().replace(/ /g,'').includes(key.replace(/ /g,'').toLowerCase());
            if (isMatch && applicationName) isMatch = model.applicationName.toLowerCase().replace(/ /g,'').includes(applicationName.replace(/ /g,'').toLowerCase());

            return isMatch;
        }), [sortApply.sortField], [sortApply.sortDirection]);
        const totalItem = data.length;
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        const paginatedData = data.slice(start, end);

        return {
            data: paginatedData,
            totalItem: totalItem
        };
    }

    getConfiguration(id: number) {
        const model = this.dataSourceSubject.value.find((model) => model.id === id)
        if (!model) throw new Error(`Configuration with id ${id} is not found`);
        return model;
    }

    updateConfiguration(updateData : ConfigurationModel) {
        const currentData = this.dataSourceSubject.value;
        const index = currentData.findIndex((model) => model.id === updateData.id);
        if (index === -1) throw new Error(`Configuration with id ${updateData.id} not found`);
        
        currentData[index].key = updateData.key;
        currentData[index].applicationName = updateData.applicationName;
        currentData[index].value = updateData.value;
        currentData[index].versionNumber = updateData.versionNumber;
        currentData[index].lastModifiedBy = 'You';
        currentData[index].lastModifiedOn = new Date();
    }

    addNewConfiguration(newData: ConfigurationModel) {
        const ids = this.dataSourceSubject.value.map((model) => model.id);
        const newId = Math.max(...ids);
        newData.id = newId + 1;

        const currentItems = this.dataSourceSubject.value;
        this.dataSourceSubject.next(([...currentItems, newData]))
    }

    deleteConfiguration(id : number) {
        const currentData = this.dataSourceSubject.value;
        this.dataSourceSubject.next(currentData.filter((model) => model.id !== id))
    }

    checkKeyExist (key: string, versionNumber: string) : boolean {
        return this.dataSourceSubject.value.findIndex(setting => setting.key === key && setting.versionNumber === versionNumber) !== -1;
    }
}