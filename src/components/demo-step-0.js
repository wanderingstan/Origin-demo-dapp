import React, { Component } from 'react'
import { render } from 'react-dom'

import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'

import bs58 from 'bs58'

class DemoStep0 extends Component {

  constructor(props) {
    super(props)

    this.state = {
      listingsResults: [],
      contractListingsCount: -1
    }

    let that = this

    window.addEventListener('load', function() {
      setTimeout(function() {
        // TODO: Remove hacky 2s delay and correctly determine when contractService
        // is ready. Problem is that web3-service.js waits for the page to load.
        contractService.getAllListings().then((allContractResults) => {
          var resultIndex;
          console.log("Got this many results:" + allContractResults.length)
          console.log(allContractResults)
          that.setState({contractListingsCount: allContractResults.length})
          for (resultIndex in allContractResults) {
            (function (contractResult) {
              const hashStr = contractResult.ipfsHash
              ipfsService.getListing(hashStr)
              .then((listingJson) => {
                const listingData = {
                  'contract': contractResult,
                  'ipfs': JSON.parse(listingJson).data
                }
                console.log(listingData)
                // Append our new result to state. For now we don't care about ordering.
                that.setState({
                  listingsResults: that.state.listingsResults.concat(listingData)
                })
              })
              .catch((error) => {
                alert(error)
              });
            })(allContractResults[resultIndex])
          }

        }).catch((error) => {
          alert('Error:  ' + error)
        });
      }, 5000);
    })
  }

  render() {
    return (
      <section className="step">
        <h3>Browse 0rigin Listings</h3>

        <div className="btn-wrapper">
          <button className="btn btn-primary" onClick={() => {
            this.props.onCreateListing()
          }}>
            Create Listing
          </button>
        </div>

         <div>

            <div
              style={{
                display: ((this.state.contractListingsCount == -1) ?
                'block' : 'none')
              }}
            >
              <img src='ajax-loader.gif'/>
              <p>Loading from blockchain</p>
            </div>

            <div
              style={{
                display: ((this.state.listingsResults.length == 0) &&
                  (this.state.listingsResults.contractListingsCount > 0)) ?
                'block' : 'none'
              }}
            >
              <img src='ajax-loader.gif'/>
              <p>Loading from IPFS</p>
            </div>
            {(this.state.contractListingsCount == 0) ? "No listings" : ""}

            {this.state.listingsResults.map(listing => (
              <div className="listing" key={listing.contract.ipfsHash}>
                <hr/>
                <h3>{listing.ipfs.name}</h3>
                <img
                  height="200"
                  src={
                    (listing.ipfs.pictures && listing.ipfs.pictures.length>0) ?
                    listing.ipfs.pictures[0] :
                    'http://www.lackuna.com/wp-content/themes/fearless/images/missing-image-640x360.png'
                  }
                />
                <br/>
                Category:{listing.ipfs.category}<br/>
                Description:{listing.ipfs.description}<br/>
                Price:{listing.ipfs.price}<br/>
                Contract Price:{listing.contract.price}<br/>
                Units Available:{listing.contract.unitsAvailable}<br/>
                IPFS Hash:{listing.contract.ipfsHash}<br/>
                  <button className="btn btn-info" onClick={() => {
                    this.props.onBuyListing(listing)
                  }}>
                    Buy It
                  </button>

              </div>
            ))}
          </div>

      </section>
    );
  }
}

export default DemoStep0
