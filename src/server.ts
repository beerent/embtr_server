require('module-alias/register');
import app from '@src/app';

const port = 3000; 

app.listen(port, () => {
    console.log(`Express is listening at http://localhost:${port}`);
});
