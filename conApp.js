// House Becomes Shop
// Room Becomes Space
// Aera Becomes Seating
// Add new column for "function"
//Store as a class needs to be able to tie both the names and the concept of a space. Ended up having to write this twice to get it operational. Better way to do it in the future I'm sure.
class Store {
    constructor(name) {
        this.name = name;
        this.space = [];
    }
// I genuinely wanted to not have this under Store because it would be functioning like a "child" which caused some issues in the code. Don't know another way to solve the problem for the time being (had to do this project on an extremely abbreviated timeline compared to usual)
    addSpace(name, seating, purpose) {
        this.space.push(new Space(this.id, name, seating, purpose));
        //This is the problem- one is pushing to a different place than the other
    }
}
// Adapted from the way it was written under the "house, room" logic since there's more elements I'd want to track (yes I know I made it harder on myself)
class Space {
    constructor(storeId, name, seating, purpose) {
        this.storeId = storeId;
        this.name = name;
        this.seating = seating;
        this.purpose = purpose;
    }
}
// All of this is supposed to be the "back end" of the OOP I guess? 
class StoreService {
    static url = 'https://662075d03bf790e070afcd1f.mockapi.io/Rule0Test/stores';
    static spaceurl = 'https://662075d03bf790e070afcd1f.mockapi.io/Rule0Test/space'
// Get all Stores method
    static getAllStores() {
        return $.get(this.url);
    }
// Specific store call
    static getStore(id) {
        return $.get(this.url + `/${id}`);
    }
// Make a new one
    static createStore(store) {
        return $.post(this.url, store);
    }
// Make a room
    static createSpace(space) {
        return $.post(this.spaceurl, space);
    }
// How to connect pieces to be updated (was surprised "append" wasn't a part of the code)
    static updateStore(store) {
        return $.ajax({
            url: this.url + `/${store.id}`,
            dataType: 'json',
            data: JSON.stringify(store),
            contentType: 'application/json',
            type: 'PUT'
        });
    }
// Get that out of here.
    static deleteStore(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

// Everything above this is the "store service" from Nick's code. Everything below it is the DOM Manager

class DOMManager {
    static stores;
// Will cause them to appear in the DOM
    static getAllStores() {
        StoreService.getAllStores().then(stores => this.render(stores));
    }
// Makes sure that the newly created store is applied to the DOM
    static createStore(name) {
        StoreService.createStore(new Store(name))
            .then(() => {
                return StoreService.getAllStores();

            })
            .then((stores) => this.render(stores));
    }
// right now this only lives in the DOM, but was written twice. I'm wondering if this needs to be reconfigred somehow?
    static deleteSpace(storeId, spaceId) {
        for (let store of this.stores) {
            if (store.id == storeId) {
                for (let space of store.space) {
                    if (space.id == spaceId) {
                        store.space.splice(store.space.indexOf(space), 1)
                        StoreService.updateStore(store)
                        .then(() => {
                            return StoreService.getAllStores();
                        })
                        .then((stores) => this.render(stores));
                    }   
                }
            }
        }
    }
// Make a room go away on the DOM
    static deleteSpace(storeId, spaceId) {
        const store = this.stores.find(store => store.id == storeId);
        if (store) {
            const spaceIndex = store.space.findIndex(space => space.id == spaceId);
            if (spaceIndex !== -1) {
                store.space.splice(spaceIndex, 1);
                StoreService.updateStore(store)
                    .then(() => {
                        return StoreService.getAllStores();
                    })
                    .then((stores) => this.render(stores));
            }
        }
    }
// Made sure to console.log this because it wasn't working in the original version of this code    
    static deleteStore(id) {
        console.log(`You are attempting to delete ${id}`)
        StoreService.deleteStore(id)
            .then(() => {
                return StoreService.getAllStores();
            })
            .then((stores) => this.render(stores));
    }
// I wrote it as both addSpace and createSpace but it didn't break? I think I get why but didn't want to touch anything while it worked (once again, short timeline)
    static addSpace(id) {
        console.log(`you are trying to use ${id}`)
                console.log(`yes it added the store spaces correctly`)
                StoreService.createSpace(
                    new Space(
                        id,
                        $(`#${id}-space-name`).val(), 
                        $(`#${id}-seating`).val(), 
                        $(`#${id}-purpose`).val()
                    )
                )
                    .then(() => {
                        return StoreService.getAllStores();
                    })
                    .then((stores) => this.render(stores));
                
            };
    // Here's where all the HTML gets spat out- its one heck of a for loop
    static render(stores) {
        this.stores = stores;
        $('#app').empty();
        for (let store of stores) {
            // console.log(JSON.stringify(store,2,null))- had this in there because something was only processing to the API as opposed to on the DOM. Thankfully it helped me troubleshoot.
            $('#app').prepend(
                `<div id="${store.id}" class ="card">
                    <div class="card header">
                        <h2>${store.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteStore('${store.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${store.id}-space-name" class="form-control" placeholder="Space Name" />
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store.id}-purpose" class="form-control" placeholder="Function" />
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${store.id}-seating" class="form-control" placeholder="Seating" />
                                </div>
                            </div>
                            <button id="${store.id}-new-space" onclick="DOMManager.addSpace(${store.id})" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            // so this makes sure the rooms I'm making show up where and how they're supposed to. This was complicated due to having stores and spaces listed as two DIFFERENT paths within the mockAPI. Good practice I guess.
            for (let space of store.space) {
                $(`#${store.id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${space.id}"><strong>Name: </strong> ${space.name}</span>
                        <span id="area-${space.id}"><strong>Seating: </strong> ${space.seating}</span>
                        <span id="function-${space.id}"><strong>Purpose: </strong> ${space.purpose}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteSpace('${store.id}', '${space.id}')">Delete Space</button>
                    </p>`
                );
            }
        }
    }
}
// have to make the button for the HTML work. Why is "click" crossed out?
$('#create-new-store').click(() => {
    DOMManager.createStore($('#new-store-name').val());
    $('#new-store-name').val('');
    // should probably be a line here expressing that space is a blank value until populated. Not sure which one to do.
})
// Run this code at the end or it won't actually show up...
DOMManager.getAllStores();