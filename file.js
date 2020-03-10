const fs = require('fs');
const path = require('path');

let filePath = process.argv[2]; // 获取输入的参数
let fileDataMap = {};

const readFile = function (fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (error, data) => {
            if (error) return reject(error);

            resolve(data);
        });
    });
};

// 读取文件名键值对
(async function () {
    const data = await readFile('./data.json');
    fileDataMap = JSON.parse(data.toString());

    // 执行
    readDir(filePath);
})();


let iconResult = [];

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function readDir(filePath) {
    // 根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, (err, files) => {
        if (err) {
            console.warn(err);
        } else {
            // 遍历读取到的文件列表
            files.map(filename => {
                // 获取当前文件的绝对路径
                const fileDir = path.join(filePath, filename);

                // 根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(fileDir, (error, stats) => {
                    if (error) {
                        console.warn('获取文件stats失败');
                    } else {
                        const isFile = stats.isFile(); // 是文件
                        const isDir = stats.isDirectory(); // 是文件夹

                        if (isFile) {
                            (async function () {
                                const iconReg = /el-icon-[a-z0-9]+(-[a-z0-9]+)?/g;
                                let fileData = await readFile(fileDir);
                                fileData = fileData.toString();
                                const icons = fileData.match(iconReg);

                                if(icons) {
                                    iconResult = [...iconResult, ...icons];
                                }

                                iconResult = [...new Set(iconResult)];

                                // 更新file
                                fs.writeFile('./icon.json', JSON.stringify(iconResult), 'utf8', (err) => {
                                    if (err) return console.log(err);

                                    if(!err) {
                                        console.log(fileDir + '写入成功！');
                                    }
                                });
                            })();
                        }
                        if (isDir) {
                            readDir(fileDir); // 递归，如果是文件夹就继续遍历
                        }
                    }
                })
            });
        }
    });
}