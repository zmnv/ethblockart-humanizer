import { EthBlock } from "./types";

const SeasonsList = {
    winter: 'winter',
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
}

export function getBlockHumanizedSeason({ timestamp }: Pick<EthBlock, 'timestamp'>) {
    const month = new Date(timestamp*1000).getMonth();
    switch (month) {
        case 0:
        case 1:
        case 11:
            return SeasonsList.winter;
        case 2:
        case 3:
        case 4:
            return SeasonsList.spring;
        case 5:
        case 6:
        case 7:
            return SeasonsList.summer;
        case 8:
        case 9:
        case 10:
            return SeasonsList.autumn;
    }
}

const DaytimeList = {
    night: 'night',
    morning: 'morning',
    day: 'day',
    afterday: 'afterday',
    evening: 'evening'
}

export function getBlockHumanizedDaytime({ timestamp }: Pick<EthBlock, 'timestamp'>) {
    const hours = new Date(timestamp*1000).getUTCHours();

    if (hours < 6) {
        return DaytimeList.night;
    } else if (hours < 12) {
        return DaytimeList.morning;
    } else if (hours < 16) {
        return DaytimeList.afterday;
    } else if (hours < 24) {
        return DaytimeList.evening;
    }

    return null;
}