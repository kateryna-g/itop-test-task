import React, {useEffect, useState} from 'react';
import {fromEvent, interval} from 'rxjs';
import {buffer, debounceTime, filter, map, scan, share, startWith,} from 'rxjs/operators';
import './App.css';

const App = () => {
    const [time, setTime] = useState(0); // используем React Hooks для time и pause
    const [pause, setPause] = useState(true);
    let timer$ = interval(1000); // создаем Observable timer$ и задаем ему интервал в 1 секунду

    useEffect(() => {
        let startCount; // обьявляем переменную startCount и присваем ей Observable timer$
        startCount = timer$
            .pipe(
                startWith(time), // задаем стартовое значение для потока
                scan(time => time + 1), // увеличиваем time каждую секунду на единицу
                share() // делаем hot Observable
            )
            .subscribe(n => { // если поток не на паузе устанавливаем
                if (!pause) {      // значение времени равное текущему значению из потока
                    setTime(n);
                }
            })
        return () => startCount.unsubscribe(); // отписываемся от Observable
    }, [pause, time, timer$]);    // добавляем зависимости изменение которых возобновит подписку на поток

    const start = () => {
        setPause(false);
    };

    const stop = () => {
        setPause(true);
        setTime(0);
    };

    const reset = () => {
        setPause(false);
        setTime(0);
    };

    const wait = (event) => {
        const click$ = fromEvent(event.target, event.type); // создаем Observable, который генерирует событие
        const doubleClick$ = click$.pipe(                   // click, исходящие от цели события
            buffer(click$.pipe(debounceTime(300))), // сохраняем ивенты в буфер с задержкой не более 300млс
            map(clicks => clicks.length),
            filter(clicksLength => clicksLength >= 2) // фильтруем елементы, отбрасывая те,
        );                                                    // что не удовлетворяют указанному условию
        doubleClick$.subscribe(() => {   // подписываемся на Observable doubleClick$ и устанавливаем
            setPause(true);             // значение pause равным true
        });
    };

    // получаем время в формате 00:00:00 из строки даты
    const getTimeFromDateString = (time) => {
        return new Date(time * 1000).toISOString().substr(11, 8)
    }

    return (
        <div className="container">
            <h2>{getTimeFromDateString(time)}</h2>
            <div className='actions'>
                <button onClick={start}>Start</button>
                <button onClick={stop}>Stop</button>
                <button onClick={wait}>Wait</button>
                <button onClick={reset}>Reset</button>
            </div>
        </div>
    );
}

export default App;
