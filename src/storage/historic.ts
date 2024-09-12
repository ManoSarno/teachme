export function getHistoric(): string[] {
  const historic = localStorage.getItem("historic");

  if(historic) {
    return JSON.parse(historic);
  }

  return [];
}

export function setHistoric(item: string) {
  const historic = getHistoric();

  if(historic) {
    localStorage.setItem("historic", JSON.stringify([...historic, item]));
    return
  }

  localStorage.setItem("historic", JSON.stringify([item]))
}
