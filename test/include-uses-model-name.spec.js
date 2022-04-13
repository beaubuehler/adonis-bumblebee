'use strict'

const test = require('japa')

const setup = require('./setup')
const {
  ioc
} = require('@adonisjs/fold')
const Bumblebee = require('../src/Bumblebee')
const TransformerAbstract = require('../src/Bumblebee/TransformerAbstract')

class AuthorTransformer extends TransformerAbstract {
  static get availableInclude() {
    return [
      'books'
    ]
  }

  transform(author) {
    return {
      first_name: author.first_name,
      last_name: author.last_name,
      birth_year: author.birth_year
    }
  }

  includeBooks(books) {
    return this.collection(books, BookTransformer)
  }
}

class BookTransformer extends TransformerAbstract {
  static get availableInclude() {
    return [
      'authorSummary',
      'characters'
    ]
  }

  transform(book) {
    return {
      id: book.id,
      title: book.title,
      year: book.yr
    }
  }

  includeAuthorSummary(book) {
    return this.item(book.author, AuthorTransformer)
  }
}


class Author {
  constructor({
    first_name,
    last_name,
    birth_year,
  }) {
    this.first_name = first_name
    this.last_name = last_name
    this.birth_year = birth_year
  }
}

class Book {
  constructor({
    id,
    title,
    yr,
    author
  }) {
    this.id = id
    this.title = title
    this.yr = yr
    this.author = author
  }
}

const book = new Book({
  id: 1,
  title: 'The Lord of the Rings',
  yr: 1954,
  author: new Author({
    first_name: 'J. R. R.',
    last_name: 'Tolkien',
    birth_year: 1892
  })
})

test.group('Naming included objects', (group) => {
  group.before(async () => {
    await setup()
  })

  test('Uses include name if includeUsesModelName = false', async (assert) => {
    const config = ioc.use('Adonis/Src/Config')

    config.set('bumblebee', {
      includeUsesModelName: false,
    })

    const transformed = await Bumblebee.create()
      .include('authorSummary')
      .item(book)
      .transformWith(BookTransformer)
      .toJSON()

    //console.log(transformed)

    assert.deepEqual(transformed, {
      id: 1,
      title: 'The Lord of the Rings',
      year: 1954,
      authorSummary: {
        first_name: 'J. R. R.',
        last_name: 'Tolkien',
        birth_year: 1892,
      }
    })
  })

  test('Uses model name if includeUsesModelName = true', async (assert) => {
    const config = ioc.use('Adonis/Src/Config')

    config.set('bumblebee', {
      includeUsesModelName: true,
    })

    const transformed = await Bumblebee.create()
      .include('authorSummary')
      .item(book)
      .transformWith(BookTransformer)
      .toJSON()

    assert.deepEqual(transformed, {
      id: 1,
      title: 'The Lord of the Rings',
      year: 1954,
      author: {
        first_name: 'J. R. R.',
        last_name: 'Tolkien',
        birth_year: 1892,
      }
    })
  })

})
