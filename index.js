import {gql, ApolloServer ,UserInputError} from 'apollo-server';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

let persons = [
    {
      "name": "Midu",
      "phone": "034-1234567",
      "street": "Calle Frontend",
      "city": "Barcelona",
      "id": "dac7c2b4-d16f-4531-b1c2-f5390a524be4"
    },
    {
      "name": "Youseff",
      "phone": "044-1234567",
      "street": "Avenida Fullstack",
      "city": "Mataro",
      "id": "595be404-9929-4a52-96d9-57c1eef59edc"
    },
    {
      "name": "Itzi",
      "street": "Pasaje Testing",
      "city": "Ibiza",
      "id": "6aeafa1d-05e4-46cd-8a0b-cd2e98bf3240"
    }
  ]

const  typeDefs = gql`

    enum YesNo {
        YES,
        NO
    }

    type Address {
        street: String!
        city: String!
    }

    type Contact{
        name: String
        phone : String
    }

    type Person {
        name:String!
        phone: String
        address: Address,
        contact : Contact
        id: ID!
    }

    type Query {
        personsCount: Int!
        allPersons(phone:YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person
    
        editNumber(
            name: String!
            phone: String!
        ):Person
    }

`;


const resolvers = {
    Query:{
        personsCount: () => persons.length,
        allPersons: async (root,args) => {

            // const {data : personsFromRestApi} = await axios.get('http://localhost:3000/persons');
            
            if(!args.phone){
                return persons
            }
            
            const byPhone = person => {
                return args.phone === "YES" ? person.phone : !person.phone
            }

            return persons.filter(byPhone);
            
        },
        findPerson: (root,args) => {
            const { name } = args;
            return persons.find(person => person.name === name);
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if(persons.find( p =>  p.name === args.name )){
                throw new UserInputError('Name must be unique',
                {
                    invalidArgs: args.name
                })
            }
            const person = {...args, id: uuid()};
            persons.push(person)
            return person
        },

        editNumber: (root,args) => {

            const person = persons.find( p =>  p.name === args.name);
            
            if(!person) return null

            const update = {...person, phone : args.phone  }

            persons = persons.map(pers => {
                if(update.name === pers.name){
                    pers = update;
                }

                return pers
            })

            return update

        } 
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city:  root.city
            }
        },
        contact : (root) => {
            return {
                name: root.name,
                phone: root.phone
            }
        }
    }

}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`);
});