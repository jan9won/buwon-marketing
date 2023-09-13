import { existsSync } from "fs";
import { parse } from 'path';

const renameIncrementally = (PATH:string) => {
  const parsedPath = parse(PATH);
  // const pattern = new RegExp('^(.*)\\((\\d*)\\)$');
  const pattern = new RegExp(/^(.*)\((\d*)\)$/);
  const matchResult = pattern.exec(parsedPath.name)
  return matchResult
    ? matchResult[2]
      ? `${parsedPath.dir}/${matchResult[1]}(${parseInt(matchResult[2])+1})${parsedPath.ext}`
      : `${parsedPath.dir}/${parsedPath.name}(1)${parsedPath.ext}`
    : `${parsedPath.dir}/${parsedPath.name}(1)${parsedPath.ext}`
}

const checkPathExists = async (PATH:string) => {
  return new Promise<boolean>((resolve) => {
    const exists = existsSync(PATH);
    resolve(exists)
  });
}

const create = async (PATH:string) => {
  while (await checkPathExists(PATH)) {
    PATH = renameIncrementally(PATH);
  }
  return PATH;
}

const find = async (PATH:string) => {
  let PATH_BEFORE;

  while (await checkPathExists(PATH)) {
    PATH_BEFORE = PATH;
    PATH = renameIncrementally(PATH);
  }

  if (PATH_BEFORE === undefined) 
    throw new Error(`Given path ${PATH} does not exist`);

  return PATH_BEFORE;
}

export const incrementalFileNaming = {
  create,
  find
}
