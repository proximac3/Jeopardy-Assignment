//Category Div Selector
const $categoryRowDivSelector = $('.categories').get(0)
//Game bord Div selector
const $gameBoardDivSelector = $('.board').get(0)

    
class JeopardyGame {

    //get categories from Jeopardi API
    async getCategories() {
        //get categories from API
        const res = await axios.get('https://jservice.io/api/categories?count=100')

        //categories to be returned.
        let result = []

        //keeps track of which categories have already been selected to avoid duplicated.
        let categoriesTracker = []
        
        //Select 6 random categories
        let numberOfElementsSelected = 0
        while (numberOfElementsSelected < 6) {
            let randomNumber = Math.floor(Math.random() * res.data.length)
            if (!categoriesTracker.includes(randomNumber)) {
                // get id of random category picked
                let catId = res.data[randomNumber].id

                //get category data and check if if has more than at least 6 Q&A for 6 rows.
                let cluesCount = await axios.get(`https://jservice.io/api/category?id=${catId}`)

                //if Category has at least 6 Q and A then add to categories to be returned.
                if (cluesCount.data.clues.length > 5) {
                    categoriesTracker.push(randomNumber)
                    let temp = res.data.slice(randomNumber, randomNumber+1)
                    result.push(temp[0])
                    numberOfElementsSelected++
                }
                
            }
        }
    
        return result;
    }


   //Generate top 6 categories row Elements and Append to DOM
    async categoriesRow(NumberOfRows) {
        // get six random categories using getCategories() method
        let categoriesElements = await this.getCategories()

        for (let i = 0; i < NumberOfRows; i++) {
            $(`<div class="col-2" id="${categoriesElements[i].id}"> 
            ${categoriesElements[i].title} </div>`).appendTo($categoryRowDivSelector)
        }
        return categoriesElements
    }


    //Generate categories row, 6 * 5 board elements and append to dom.
    async generateGameBoard(numberOfElementOnBoard) {
        //Categories row elemnts.
        const topRowElements = await this.categoriesRow(6)
        
        //Generate board elements and append to DOM
        for (let i = 0; i < numberOfElementOnBoard; i++) {
            $(`<div class="col-2 boardEl col-sm-2" > <p display: none> ? </p> </div>`).appendTo($gameBoardDivSelector)
        }
        
        //Model 6 * 5 board into array to implement logic.
        const SelectBoardELem = Array.from($('.boardEl'))
        const modelOfBoard = [SelectBoardELem.slice(0, 6), SelectBoardELem.slice(6, 12), SelectBoardELem.slice(12, 18), SelectBoardELem.slice(18, 24), SelectBoardELem.slice(24, 30)]
        
        

        // Get questions and answers from jeopardi API and append to DOM
        // use to access question and answer index.
        let cluesAccessNumber = 0

        //use to access category id to get Q & A for category.
        let CurrentCategory = 0;

        //loop over model of board and append questions and answer for each category onto DOM
        for (let i = 0; i < modelOfBoard.length; i++) {

            for (let j = 0; j < modelOfBoard[i].length; j++) {
                //get category id
                const categoryId = topRowElements[CurrentCategory].id
                //use category id to get data for category.
                const categoryData = await axios.get(`https://jservice.io/api/category?id=${categoryId}`)

                // Append questions and answers to DOM
                const question = $(`<div class = "questions" id="0" style="display: none"> ${categoryData.data.clues[cluesAccessNumber].question} </div>`)
                const answer = $(`<div class = "answers" id="0" style="display: none">  ${categoryData.data.clues[cluesAccessNumber].answer} </div>`)
                modelOfBoard[i][j].append(question[0])
                modelOfBoard[i][j].append(answer[0])
                CurrentCategory++

                // NOTE: id='0'  on question and answer will be used to handle click events. 
            }
            CurrentCategory = 0
            cluesAccessNumber++
        }
    }
    

}


//create new game 
const jeopardyGame1 = new JeopardyGame()
//Generate Game board
jeopardyGame1.generateGameBoard(30)



//Reveal Questiion and answers Event handling
$('.board').on('click', function (evt) {
    //hide question mark on element
    $(evt.target.children[0]).hide()
    
    //reveal question when element is clicked
    if ($(evt.target.children[1]).attr('id') === '0') {
        $(evt.target.children[1]).show()
    } 
    
    //reveal answer when same element is clicked again
    if ($(evt.target.children[1]).attr('id') === '1' && $(evt.target.children[2]).attr('id') === '0') {
        $(evt.target.children[2]).show()
        $(evt.target.children[1]).hide()
        $(evt.target.children[2]).attr('id', '1')
    }
    $(evt.target.children[1]).attr('id', '1')

})


//restarting Game
$('.btn').on('click', function (e) {
    $('.col-2').remove()
    
    jeopardyGame1.generateGameBoard(30)
})