import {int} from "neo4j-driver"

export const streamQueryOutline = (callAlgorithm) => `${callAlgorithm}
WITH gds.util.asNode(nodeId) AS node, score
RETURN node, score
ORDER BY score DESC
LIMIT toInteger($limit)
`

export const communityStreamQueryOutline = (callAlgorithm) => `${callAlgorithm}
WITH gds.util.asNode(nodeId) AS node, community
RETURN node, community
ORDER BY community DESC
LIMIT toInteger($limit)
`

export const getFetchCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.writeProperty}\`)
RETURN node, node.\`${config.writeProperty}\` AS score
ORDER BY score DESC
LIMIT toInteger($limit)`
}

export const getFetchLouvainCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.writeProperty}\`)
WITH node, node.\`${config.writeProperty}\` AS community
RETURN node, 
       CASE WHEN apoc.meta.type(community) = "long[]" THEN community[-1] ELSE community END AS community, 
       CASE WHEN apoc.meta.type(community) = "long[]" THEN community ELSE null END as communities
LIMIT toInteger($limit)`
}

export const getCommunityFetchCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.writeProperty}\`)
RETURN node, node.\`${config.writeProperty}\` AS community
LIMIT toInteger($limit)`
}

export const getFetchTriangleCountCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.writeProperty}\`)
RETURN node, node.\`${config.writeProperty}\` AS triangles
ORDER BY triangles DESC
LIMIT toInteger($limit)`
}

export const getFetchNewTriangleCountCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.writeProperty}\`) 
RETURN node, node.\`${config.writeProperty}\` AS triangles
ORDER BY triangles DESC
LIMIT toInteger($limit)`
}

export const getFetchLocalClusteringCoefficientCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.clusteringCoefficientProperty}\`)
RETURN node, node.\`${config.clusteringCoefficientProperty}\` AS coefficient
ORDER BY coefficient DESC
LIMIT toInteger($limit)`
}

export const getFetchNewLocalClusteringCoefficientCypher = (label, config) => {
  const escapedLabel = config.nodeProjection && config.nodeProjection !== "*" ? ":`" + config.nodeProjection + "`" : ""
  return `MATCH (node${escapedLabel})
WHERE exists(node.\`${config.writeProperty}\`)
RETURN node, node.\`${config.writeProperty}\` AS coefficient
ORDER BY coefficient DESC
LIMIT toInteger($limit)`
}

export const pathFindingParams = ({startNodeId, startNode, endNodeId, endNode, delta, propertyKeyLat, propertyKeyLon, label, relationshipType, direction, persist, writeProperty, weightProperty, clusteringCoefficientProperty, communityProperty, includeIntermediateCommunities, intermediateCommunitiesWriteProperty, defaultValue, concurrency, limit, requiredProperties}) => {
  const params = {
    limit: parseInt(limit) || 50,
    config: {}
  }

  params.startNodeId = parseInt(startNodeId)
  params.endNodeId = parseInt(endNodeId)
  params.startNode = startNode || null
  params.endNode = endNode || null

  const parsedWeightProperty = weightProperty ? weightProperty.trim() : weightProperty
  const parsedWriteProperty = writeProperty ? writeProperty.trim() : writeProperty

  const config = {
    nodeProjection: label || "*",
    relationshipProjection: createRelationshipProjection(relationshipType, direction, weightProperty, defaultValue),
    relationshipWeightProperty: parsedWeightProperty || null,
    // weightProperty: parsedWeightProperty || null,
    // defaultValue: parseFloat(defaultValue) || 1.0,
    write: true,
    propertyKeyLat: propertyKeyLat,
    propertyKeyLon: propertyKeyLon,
    delta: delta
  }

  if (persist) {
    config.writeProperty = parsedWriteProperty
  }

  requiredProperties.push("nodeProjection")
  requiredProperties.push("relationshipProjection")

  params.config = filterParameters({...params.config, ...config}, requiredProperties)
  return params
}

export const nodeSimilarityParams = ({label, relationshipType, categoryLabel, direction, persist, writeProperty, defaultValue, weightProperty, writeRelationshipType, similarityCutoff, degreeCutoff, concurrency, limit, requiredProperties}) => {
  const params = {
    limit: parseInt(limit) || 50,
  }

  const config = {
    similarityCutoff: parseFloat(similarityCutoff),
    degreeCutoff: degreeCutoff == null ? null : int(degreeCutoff),
    nodeProjection: label || "*",
    relationshipProjection: createRelationshipProjection(relationshipType, direction, weightProperty, defaultValue),

  }

  if (persist) {
    config.writeProperty = writeProperty || null
    config.writeRelationshipType = writeRelationshipType || null
  }

  requiredProperties.push("nodeProjection")
  requiredProperties.push("relationshipProjection")

  params.config = filterParameters({...params.config, ...config}, requiredProperties)
  return params
}


export const similarityParams = ({itemLabel, relationshipType, categoryLabel, direction, persist, writeProperty, weightProperty, writeRelationshipType, similarityCutoff, degreeCutoff, concurrency, limit, requiredProperties}) => {
  const params = {
    limit: parseInt(limit) || 50,
    itemLabel: itemLabel || null,
    relationshipType: relationshipType || null,
    categoryLabel: categoryLabel || null,
    weightProperty: weightProperty || null,
    config: {}
  }

  const config = {
    nodeProjection: '*',
    relationshipProjection: '*',
    writeProperty: writeProperty || null,
    writeRelationshipType: writeRelationshipType || null,
    similarityCutoff: parseFloat(similarityCutoff),
    degreeCutoff: degreeCutoff == null ? null : int(degreeCutoff),
  }
  
  requiredProperties.push("nodeProjection")
  requiredProperties.push("relationshipProjection")

  params.config = filterParameters({...params.config, ...config}, requiredProperties)
  return params
}

export const communityParams = ({label, relationshipType, direction, persist, writeProperty, weightProperty, clusteringCoefficientProperty, communityProperty: seedProperty, includeIntermediateCommunities, intermediateCommunitiesWriteProperty, defaultValue, concurrency, limit, requiredProperties}) => {
  const params = baseParameters(label, relationshipType, direction, concurrency, limit, weightProperty, defaultValue)

  const parsedWeightProperty = weightProperty ? weightProperty.trim() : weightProperty
  const parsedWriteProperty = writeProperty ? writeProperty.trim() : writeProperty

  const config = {
    write: true,
    clusteringCoefficientProperty: clusteringCoefficientProperty,
    includeIntermediateCommunities: includeIntermediateCommunities || false,
    // intermediateCommunitiesWriteProperty: intermediateCommunitiesWriteProperty || null,
    seedProperty: seedProperty || ""
  }

  if (persist) {
    config.writeProperty = parsedWriteProperty
  }

  requiredProperties.push("nodeProjection")
  requiredProperties.push("relationshipProjection")

  params.config = filterParameters({...params.config, ...config}, requiredProperties)
  return params
}

export const centralityParams = ({label, relationshipType, direction, persist, writeProperty, weightProperty, defaultValue, concurrency, dampingFactor, maxIterations, maxDepth, probability, strategy, limit, normalization, requiredProperties}) => {
  const params = baseParameters(label, relationshipType, direction, concurrency, limit, weightProperty, defaultValue)

  const parsedProbability = parseFloat(probability)
  const parsedMaxDepth = maxDepth == null ? null : int(maxDepth)
  const parsedIterations = maxIterations == null ? null : int(maxIterations)
  // const parsedWeightProperty = weightProperty ? weightProperty.trim() : weightProperty
  const parsedWriteProperty = writeProperty ? writeProperty.trim() : writeProperty

  const config = {
    dampingFactor: parseFloat(dampingFactor) || null,
    maxIterations: parsedIterations && parsedIterations > 0 ? parsedIterations : null,
    maxDepth: parsedMaxDepth && parsedMaxDepth > 0 ? parsedMaxDepth : null,
    probability: parsedProbability && parsedProbability > 0 ? parsedProbability : null,
    strategy: strategy,
    write: true,
    normalization: normalization || null
  }

  if (persist) {
    config.writeProperty = parsedWriteProperty
  }

  requiredProperties.push("nodeProjection")
  requiredProperties.push("relationshipProjection")

  params.config = filterParameters({...params.config, ...config}, requiredProperties)
  return params
}


export const createRelationshipProjection = (relationshipType, direction, weightProperty, defaultValue) => {
  const relTypeKey = "relType"

  return relationshipType == null ? {
      [relTypeKey]: {
        type: "*",
        orientation: direction == null ? "NATURAL" : direction.toUpperCase()
      }
    }
    : {
      [relTypeKey]: {
        type: relationshipType,
        orientation: direction == null ? "NATURAL" : direction.toUpperCase(),
        properties: !weightProperty ? {} : {
          [weightProperty]: {property: weightProperty, defaultValue: parseFloat(defaultValue) || null},
        }
      }
    }
}

export const baseParameters = (label, relationshipType, direction, concurrency, limit, weightProperty, defaultValue) => {
  const parsedWeightProperty = weightProperty ? weightProperty.trim() : weightProperty

  // console.log("baseParameters...", neo.int(concurrency), neo.isInt(neo.int(concurrency)))

  return {
    limit: parseInt(limit) || 50,
    config: {
      nodeProjection: label || "*",
      relationshipProjection: createRelationshipProjection(relationshipType, direction, weightProperty, defaultValue),
      relationshipWeightProperty: parsedWeightProperty || null
    }
  }
}

export const filterParameters = (raw, allowed) => {
  return Object.keys(raw)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: raw[key]
      };
    }, {});
}
