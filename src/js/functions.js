export default function randomInteger(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export function matrix(num) { // num число клеток
  const finalMatrix = [];
  const sqrt = Math.sqrt(num); // число ячеек в стобце\строки квадратного поля

  const arrOfNum = [];
  for (let i = 0; i < num; i += 1) { // перебираем все клетки
    arrOfNum.push(i); // и кидаем их в отдельный массив
  }

  for (let i = 0; i < sqrt; i += 1) { // тут пихаем это всё в строки
    finalMatrix[i] = [];
    arrOfNum.forEach((e) => {
      if (e < sqrt * (i + 1) && e >= sqrt * i) {
        finalMatrix[i].push(e);
      }
    });
  }
  return finalMatrix;
}
